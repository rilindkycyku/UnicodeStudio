import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <footer className="footer-container">
            <motion.div
                className="glass-card footer-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="footer-main">
                    <p className="copyright">
                        &copy; {new Date().getFullYear()} <span className="brand-name">Unicode Studio</span>
                    </p>
                    <p className="owner">
                        Produkt i <span className="company-name">BESA NJË SH.P.K.</span>
                    </p>
                </div>

                <div className="footer-divider" />

                <div className="footer-dev">
                    <span className="dev-text">Zhvilluar me ❤️ nga </span>
                    <a
                        href="https://rilindkycyku.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dev-link"
                    >
                        Rilind Kyçyku
                    </a>
                </div>
            </motion.div>
        </footer>
    );
}
