import React, { useState } from 'react';
import axios from 'axios';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    subject: '',
    booking_reference: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/contact`, formData);
      
      if (response.data.success) {
        setSubmitResult(response.data);
        // Clear form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          subject: '',
          booking_reference: '',
          message: ''
        });
      } else {
        setError(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message
  if (submitResult) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
          <p className="text-slate-600 max-w-md">
            {submitResult.message}
          </p>
          <p className="text-sm text-slate-500">
            Reference ID: <span className="font-mono font-medium">{submitResult.reference_id}</span>
          </p>
          <p className="text-sm text-slate-500">
            A confirmation email has been sent to your email address.
          </p>
          <Button 
            onClick={() => setSubmitResult(null)} 
            variant="outline"
            className="mt-4"
          >
            Send Another Message
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
            <input 
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
            <input 
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
              placeholder="Smith"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
          <input 
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
            placeholder="john@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
          <input 
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
            placeholder="+44 7XXX XXXXXX"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
          <select 
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
          >
            <option value="">Select a subject</option>
            <option value="Booking Enquiry">Booking Enquiry</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Refund Request">Refund Request</option>
            <option value="Feedback">Feedback</option>
            <option value="Partnership Enquiry">Partnership Enquiry</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Booking Reference (if applicable)</label>
          <input 
            type="text"
            name="booking_reference"
            value={formData.booking_reference}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all disabled:bg-slate-100"
            placeholder="e.g., FL380ABC"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none disabled:bg-slate-100"
            placeholder="How can we help you?"
          ></textarea>
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
    </Card>
  );
};
