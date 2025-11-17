import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

function Footer() {
  return (
   <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 shadow-inner mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm md:text-base">
            Made with ❤️ by <span className="font-bold text-green-400">Jethanand Malhi</span>
          </p>
          <div className="flex gap-5 text-2xl">
            <a href="https://www.facebook.com/jethanand.malhi.94" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors duration-300"><FaFacebook /></a>
            <a href="https://www.instagram.com/jeth_anandmalhi/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors duration-300"><FaInstagram /></a>
            <a href="https://www.linkedin.com/in/jethanand-malhi-319ba9212/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors duration-300"><FaLinkedin /></a>
            <a href="https://github.com/Jethanandj52/JethanandMalhi" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors duration-300"><FaGithub /></a>
          </div>
        </div>
      </footer>
  );
}

export default Footer;
