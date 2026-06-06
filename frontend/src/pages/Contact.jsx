
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { sendContactMessage }
from "../services/contactService";



export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async () => {
  try {

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    await sendContactMessage({
      name,
      email,
      message,
    });

    alert(
      "Thank you! Message sent successfully."
    );
    setName('');
    setEmail('');
    setMessage('');

  } catch (error) {

    alert(
      "Failed to send message."
    );

  }
};
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-glass backdrop-blur-xl">
          <h1 className="text-4xl font-semibold text-white">Contact Us</h1>
          <p className="mt-3 text-slate-400">Reach out for support, wholesale inquiries, and partnership opportunities.</p>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
              <p className="text-xl font-semibold text-white" >Send a message</p>
              <input className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none"   value={name} onChange={(e) => setName(e.target.value)}   placeholder="Your name" />
              <input className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none"   value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
              <textarea className="h-40 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none" value={message} onChange={(e) => setMessage(e.target.value)}placeholder="How can we help?" />
              <button className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"    onClick={handleSubmit} >Send Message</button>
            </div>
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glass">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Phone</p>
                <p className="mt-2 text-lg text-white">+91 9705158667</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Email</p>
                <p className="mt-2 text-lg text-white">FreshMartvegetables90@gmail.com</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Address</p>
                <p className="mt-2 text-lg text-white">Karmanghat,Hyderabad</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 text-sm text-slate-300">
                Google Maps placeholder for the store location can be embedded here once deployed.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    
  );
 
}
