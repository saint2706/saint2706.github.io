import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from '../shared/ThemeContext';
import { resumeData } from '../../data/resume';

/**
 * SkillRadar - Interactive D3.js radar chart for skills visualization
 * Only renders in dark mode for the analytics dashboard aesthetic
 * Uses actual skills from resumeData
 */
const SkillRadar = () => {
    const { isDark } = useTheme();
    const svgRef = useRef(null);

    // Get top skills from resume data (pick highest proficiency from each category)
    const radarSkills = useMemo(() => {
        const topSkills = [];
        resumeData.skills.forEach(category => {
            // Get top 2 skills from each category
            const sorted = [...category.items].sort((a, b) => b.proficiency - a.proficiency);
            sorted.slice(0, 2).forEach(skill => {
                topSkills.push({ name: skill.name, value: skill.proficiency });
            });
        });
        // Return top 8 skills for a balanced radar
        return topSkills.slice(0, 8);
    }, []);

    useEffect(() => {
        if (!svgRef.current || !isDark) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        const width = 300;
        const height = 300;
        const margin = 40;
        const radius = Math.min(width, height) / 2 - margin;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const angleSlice = (Math.PI * 2) / radarSkills.length;

        // Scale for the radius
        const rScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, radius]);

        // Draw the circular grid
        const levels = 4;
        for (let level = 1; level <= levels; level++) {
            svg.append('circle')
                .attr('r', (radius / levels) * level)
                .style('fill', 'none')
                .style('stroke', 'rgba(255, 255, 255, 0.1)')
                .style('stroke-width', 1);
        }

        // Draw the axis lines
        radarSkills.forEach((skill, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            svg.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', radius * Math.cos(angle))
                .attr('y2', radius * Math.sin(angle))
                .style('stroke', 'rgba(255, 255, 255, 0.1)')
                .style('stroke-width', 1);

            // Add labels
            const labelRadius = radius + 20;
            svg.append('text')
                .attr('x', labelRadius * Math.cos(angle))
                .attr('y', labelRadius * Math.sin(angle))
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', 'rgba(255, 255, 255, 0.7)')
                .style('font-size', '10px')
                .style('font-family', 'Space Grotesk, sans-serif')
                .text(skill.name);
        });

        // Create the radar area
        const radarLine = d3.lineRadial()
            .angle((d, i) => angleSlice * i)
            .radius(d => rScale(d.value))
            .curve(d3.curveLinearClosed);

        // Draw the radar area with gradient
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', 'radarGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '100%');

        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#8b5cf6')
            .attr('stop-opacity', 0.6);

        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ec4899')
            .attr('stop-opacity', 0.6);

        svg.append('path')
            .datum(radarSkills)
            .attr('d', radarLine)
            .style('fill', 'url(#radarGradient)')
            .style('stroke', '#8b5cf6')
            .style('stroke-width', 2)
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);

        // Draw data points
        radarSkills.forEach((skill, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = rScale(skill.value) * Math.cos(angle);
            const y = rScale(skill.value) * Math.sin(angle);

            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 5)
                .style('fill', '#8b5cf6')
                .style('stroke', '#fff')
                .style('stroke-width', 2)
                .style('cursor', 'pointer')
                .on('mouseover', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 8)
                        .style('filter', 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))');
                })
                .on('mouseout', function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('r', 5)
                        .style('filter', 'none');
                });
        });

    }, [isDark, radarSkills]);

    // Only render in dark mode
    if (!isDark) return null;

    return (
        <div className="glass-panel p-6 rounded-glass">
            <h3 className="text-lg font-heading font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Skill Proficiency
            </h3>
            <div className="flex justify-center">
                <svg ref={svgRef} />
            </div>
        </div>
    );
};

export default SkillRadar;
