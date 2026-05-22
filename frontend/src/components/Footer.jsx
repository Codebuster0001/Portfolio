import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Twitter, Mail, Instagram } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const Footer = () => {
  const [hero, setHero] = useState({ name: 'Deepak Kushwaha' });

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axiosClient.get('Hero');
        if (response.data) {
          setHero(response.data);
        }
      } catch (err) {
        console.error('[FOOTER API] Connection error.', err);
      }
    };
    fetchHeroData();
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-white/5 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              {hero.name || 'Deepak Kushwaha'}
            </h2>
            <p className="text-zinc-500 text-sm">
              Building digital experiences with passion and precision.
            </p>
          </div>
          
          <div className="flex justify-center space-x-6">
            {hero.githubUrl && (
              <a href={hero.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            )}
            {hero.linkedinUrl && (
              <a href={hero.linkedinUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {hero.twitterUrl && (
              <a href={hero.twitterUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {hero.instagramUrl && (
              <a href={hero.instagramUrl} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-blue-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {hero.gmailAddress && (
              <a href={`mailto:${hero.gmailAddress}`} className="text-zinc-400 hover:text-blue-400 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>

          <div className="text-center md:text-right">
            <p className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
            <p className="text-zinc-600 text-[10px] mt-1">
              Made with React & Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
