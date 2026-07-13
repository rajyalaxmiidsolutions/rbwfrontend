import { motion } from 'framer-motion';
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { BUSINESS } from '../utils/constants';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const Contact = () => {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Contact Us</h1>
            <p className="mt-4 text-lg text-white/70 max-w-xl">
              Get in touch with us for wholesale inquiries, custom orders, or any questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: HiOutlinePhone,
                title: 'Phone',
                detail: BUSINESS.phone,
                action: `tel:${BUSINESS.phone.replace(/\s/g, '')}`,
                actionLabel: 'Call Now',
              },
              {
                icon: HiOutlineMail,
                title: 'Email',
                detail: BUSINESS.email,
                action: `mailto:${BUSINESS.email}`,
                actionLabel: 'Send Email',
              },
              {
                icon: HiOutlineLocationMarker,
                title: 'Location',
                detail: BUSINESS.address,
                action: BUSINESS.location,
                actionLabel: 'View on Map',
              },
              {
                icon: HiOutlineClock,
                title: 'Business Hours',
                detail: 'Mon - Sat: 9:00 AM - 8:00 PM',
                action: null,
                actionLabel: null,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-border p-7 sm:p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-burgundy/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-burgundy" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-base text-gray-500 mb-4">{item.detail}</p>
                {item.action && (
                  <a
                    href={item.action}
                    target={item.action.startsWith('http') ? '_blank' : undefined}
                    rel={item.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 text-base font-medium text-burgundy hover:underline"
                  >
                    {item.actionLabel}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Form & Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form */}
            <motion.div {...fadeUp}>
              <div className="bg-white rounded-2xl border border-border p-7 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">Send us a Message</h2>
                <p className="text-base text-gray-500 mb-8">Fill in the form below and we'll get back to you shortly.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const name = formData.get('name');
                    const phone = formData.get('phone');
                    const message = formData.get('message');
                    const whatsappText = `Hello, I'm ${name}.\n\n${message}\n\nPhone: ${phone}`;
                    window.open(`https://wa.me/91${BUSINESS.phone.replace(/\s/g, '')}?text=${encodeURIComponent(whatsappText)}`, '_blank');
                  }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Your Name *</label>
                      <input
                        name="name"
                        required
                        className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy transition-colors"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number *</label>
                      <input
                        name="phone"
                        required
                        className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy transition-colors"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Subject</label>
                    <input
                      name="subject"
                      className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy transition-colors"
                      placeholder="What is this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full px-5 py-3.5 bg-bg border border-border rounded-xl text-base focus:outline-none focus:border-burgundy transition-colors resize-none"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-burgundy text-white py-4 rounded-xl text-base font-semibold hover:bg-burgundy-600 transition-colors"
                  >
                    Send via WhatsApp
                  </button>
                  <p className="text-sm text-gray-400 text-center">
                    This will open WhatsApp with your message pre-filled.
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div {...fadeUp}>
              <div className="bg-burgundy rounded-2xl p-7 sm:p-10 text-white h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose RBW?</h2>
                  <p className="text-white/70 text-base leading-relaxed mb-8">
                    With years of experience in the wedding invitation industry, we offer premium quality products at competitive wholesale prices.
                  </p>
                  <div className="space-y-5">
                    {[
                      'Premium quality wedding invitation cards',
                      'Best wholesale prices in the market',
                      'Pan-India delivery with reliable shipping',
                      'Custom bulk orders with flexible MOQ',
                      'Dedicated customer support',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-sm">✓</span>
                        </div>
                        <p className="text-base text-white/80">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-white/50 text-sm">Rajyalaxmi Binding Works & PaperMart</p>
                  <p className="text-white/50 text-sm mt-1">Hyderabad, Telangana, India</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
