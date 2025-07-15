import React from 'react';

const Footer = (): React.ReactElement => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto text-center">
        <p>© {new Date().getFullYear()} ArmutClone. Tüm hakları saklıdır.</p>
        {/* <div className="space-x-4 mt-4">
          <a href="/privacy" className="text-gray-400 hover:text-white">
            Gizlilik Politikası
          </a>
          <a href="/terms" className="text-gray-400 hover:text-white">
            Kullanım Şartları
          </a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
