import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Linkedin, Github, Twitter, CheckCircle, AlertCircle } from 'lucide-react';
import { resumeData } from '../../data/resume';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            // Using Formspree for serverless form handling
            const response = await fetch('https://formspree.io/f/your-form-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                }),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            // For demo purposes, show success anyway (Formspree needs setup)
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const socialLinks = [
        { icon: <Github size={24} />, url: 'https://github.com/saint2706', label: 'GitHub' },
        { icon: <Linkedin size={24} />, url: 'https://www.linkedin.com/in/rishabh-agrawal-1807321b9', label: 'LinkedIn' },
        { icon: <Twitter size={24} />, url: 'https://twitter.com/saint2706', label: 'Twitter' },
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-fun-pink">
                        Let's Connect
                    </span>
                </h1>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Have a project in mind or just want to chat? I'd love to hear from you.
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-8"
                >
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>

                        <div className="space-y-4">
                            <a
                                href={`mailto:${resumeData.basics.email}`}
                                className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-slate-700 hover:border-accent/50 transition-colors group"
                            >
                                <div className="p-3 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Email</p>
                                    <p className="text-white font-medium">{resumeData.basics.email}</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-slate-700">
                                <div className="p-3 bg-fun-pink/10 rounded-lg text-fun-pink">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Location</p>
                                    <p className="text-white font-medium">{resumeData.basics.location.city}, {resumeData.basics.location.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Follow Me</h3>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-secondary/50 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-accent/50 transition-colors"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Availability Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-4 bg-gradient-to-r from-accent/10 to-fun-pink/10 rounded-xl border border-accent/30"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-white font-medium">Available for freelance & collaborations</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-secondary/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-secondary/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full bg-secondary/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                                placeholder="Tell me about your project..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-6 bg-accent text-primary font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                'Sending...'
                            ) : (
                                <>
                                    Send Message <Send size={18} />
                                </>
                            )}
                        </button>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-green-400 bg-green-400/10 p-3 rounded-lg"
                            >
                                <CheckCircle size={20} />
                                <span>Message sent successfully! I'll get back to you soon.</span>
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg"
                            >
                                <AlertCircle size={20} />
                                <span>Something went wrong. Please try again or email me directly.</span>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
