import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Linkedin, Github, Twitter, ExternalLink } from 'lucide-react';
import { resumeData } from '../../data/resume';

const Contact = () => {
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
                <p className="text-secondary text-lg max-w-xl mx-auto">
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
                        <h2 className="text-2xl font-bold text-primary mb-6">Get in Touch</h2>

                        <div className="space-y-4">
                            <a
                                href={`mailto:${resumeData.basics.email}`}
                                className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-slate-700 hover:border-accent/50 transition-colors group"
                            >
                                <div className="p-3 bg-accent/10 rounded-lg text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-secondary">Email</p>
                                    <p className="text-primary font-medium">{resumeData.basics.email}</p>
                                </div>
                            </a>

                            <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl border border-slate-700">
                                <div className="p-3 bg-fun-pink/10 rounded-lg text-fun-pink">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-secondary">Location</p>
                                    <p className="text-primary font-medium">{resumeData.basics.location.city}, {resumeData.basics.location.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-primary mb-4">Follow Me</h3>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-secondary/50 rounded-xl border border-secondary text-secondary hover:text-accent hover:border-accent/50 transition-colors"
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
                            <span className="text-primary font-medium">Available for freelance & collaborations</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col justify-center"
                >
                    <div className="bg-secondary/50 border border-slate-700 rounded-2xl p-8 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent to-fun-pink rounded-full flex items-center justify-center">
                            <Mail size={36} className="text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-primary mb-4">
                            Ready to start a conversation?
                        </h3>

                        <p className="text-secondary mb-8">
                            Drop me an email and I'll get back to you as soon as possible. Let's create something amazing together!
                        </p>

                        <a
                            href={`mailto:${resumeData.basics.email}?subject=Hello from your portfolio!`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary font-bold rounded-xl hover:bg-white transition-colors"
                        >
                            <Mail size={20} />
                            Send me an Email
                            <ExternalLink size={16} />
                        </a>

                        <p className="text-muted text-sm mt-6">
                            Or use the chatbot (Ctrl+K) to learn more about me first!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Contact;
