import Link from "next/link";
export default function ShopInfoSection() {

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-black">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black opacity-50"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-orange-500 uppercase tracking-wide">
            Local Presence
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Visit Our Physical Store in Bhayandar
          </p>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Beyond the cosmos, we serve our local community. Neelkanth Stationery & Sarathi Digital Seva Kendra offers essential services and astrological guidance in person.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:border-orange-500/30 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-4">Neelkanth Stationery & Sarathi Digital</h3>
              
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-4">
                  <span className="text-orange-400 text-xl">📍</span>
                  <span>Shop No.14, Rashmi Laxmi, Navghar Road,<br/>Bhayandar East, Thane 401105</span>
                </li>
                <li className="flex gap-4 items-center">
                  <span className="text-orange-400 text-xl">📞</span>
                  <span>+91 93721 48452</span>
                </li>
                <li className="flex gap-4 items-center">
                  <span className="text-orange-400 text-xl">🕒</span>
                  <span>Monday – Saturday: 9:00 AM – 10:00 PM</span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="font-semibold text-white mb-4">Our Local Services:</h4>
                <div className="flex flex-wrap gap-2">
                  {["Aadhaar & PAN", "Voter ID", "Govt Certificates", "IRCTC Booking", "GST & MSME Filing", "Printing & Stationery"].map((service) => (
                    <span key={service} className="bg-white/10 text-slate-300 px-3 py-1 rounded-full text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link href="/about" className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center gap-1 transition-colors">
                  Learn more about us <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden h-[400px] border border-white/10 shadow-2xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15065.748057279188!2d72.8464619!3d19.2997184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b04d0b178499%3A0xc6a88b584065600c!2sNavghar%20Rd%2C%20Bhayandar%2C%20Bhayandar%20East%2C%20Mira%20Bhayandar%2C%20Maharashtra%20401105!5e0!3m2!1sen!2sin!4v1715438814777!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
