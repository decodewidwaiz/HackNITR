import { Mail, Linkedin, Globe, Heart } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { icon: Mail, href: 'mailto:nishantsankarswain@gmail.com', label: 'Email' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/nishant-sankar-swain-1abb71246', label: 'LinkedIn' },
    { icon: Globe, href: 'https://kisan-mitra-20.vercel.app/', label: 'Website' },
  ];

  return (
    <footer className="bg-gradient-to-r from-green-900 to-green-700 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-green-400 hover:text-green-900 transition-all transform hover:-translate-y-1"
                aria-label={link.label}
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
          <a href="#" className="hover:text-green-300 transition-colors">Home</a>
          <a href="https://kisan-mitra-20.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">Platform</a>
          <a href="#" className="hover:text-green-300 transition-colors">AI Engine</a>
          <a href="#" className="hover:text-green-300 transition-colors">Marketplace</a>
        </div>

        <div className="text-center text-sm text-white/80 border-t border-white/10 pt-8">
          <p>© 2025 Kisan-Mitra. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-2">
            Created with <Heart className="h-4 w-4 text-red-400 fill-current" /> by
            <span className="text-green-300 font-semibold">Nishant Sankar Swain</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
