import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import UnifiedBackground from '../components/UnifiedBackground';
import { Mail, Send, CheckCircle2, ArrowLeft, MapPin, Phone } from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen text-[#1A1A2E] flex flex-col font-sans overflow-hidden">
      {/* Premium Landing Page Background */}
      <UnifiedBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navbar */}
        <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-200 text-[#6C47FF] hover:bg-white transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Logo showText={true} textClassName="text-2xl font-black" />
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-200 text-[#1A1A2E] font-semibold text-xs hover:bg-white">
              Log in
            </Link>
            <Link to="/signup" className="px-5 py-2 rounded-2xl bg-[#6C47FF] text-white font-semibold text-xs hover:bg-[#5A36EC]">
              Sign up
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto w-full px-6 py-10 space-y-12 flex-1">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#6C47FF] bg-purple-100/80 px-3.5 py-1 rounded-full border border-purple-200">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E]">
              Contact HireNovaAI
            </h1>
            <p className="text-base text-gray-600 font-medium">
              Have questions, feedback, or need help with your account? Send us a message below.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Info Side */}
            <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-[#1A1A2E]">We'd Love to Hear From You</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Whether you are a student preparing for campus drives or an institution looking for placement solutions, our team is here to assist.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Email Us</p>
                  <p className="text-slate-900 font-extrabold text-xs">support@hirenovaai.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C47FF] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Support</p>
                  <p className="text-slate-900 font-extrabold text-xs">+91 (800) 123-4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg space-y-4">
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex flex-col items-center gap-2 my-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-1" />
                Thank you! Your message has been received.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Mahek Agarwal"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-[#6C47FF] outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="you@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-[#6C47FF] outline-none text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">Message</label>
                  <textarea 
                    required
                    rows="4"
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-purple-200 focus:border-[#6C47FF] outline-none text-sm font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#6C47FF] text-white font-bold text-sm hover:bg-[#5A36EC] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>

      </main>
      </div>
    </div>
  );
};

export default ContactPage;
