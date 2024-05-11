import React from 'react';
import { hero } from '../constants/index';
import profile from '../assets/profile2.svg';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';

const containerVariants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 1, staggerChildren: 0.1 }
    }
};

const textVariants = {
    initial: { opacity: 0, x: -500 },
    animate: { x: 0, opacity: 1, transition: { duration: 1 } }
};

const imageVariants = {
    initial: { 
        scale: 0,
        y: 20, // Initial position
    },
    animate: { 
        scale: 1,
        y: [20, -20, 20], // Animate the image up and down
        transition: {
            duration: 2,
            ease: "easeInOut",
            loop: Infinity // Loop the animation
        }
    }
};


const Hero = () => {
    return (
        <section className="bg-primary mt-10 px-5 text-white py-20">
            <motion.div className="container flex flex-col md:flex-row  gap-10  mx-auto items-center justify-between" variants={containerVariants} initial="initial" animate="animate">
                <motion.div className="flex flex-col justify-center items-center pb-5 md:pb-0 space-y-4 md:w-1/2" variants={textVariants}>
                    <motion.h1 className="text-4xl lg:text-xxl text-slate-400">Hi, I'm</motion.h1>
                    <motion.span className="mt-2 text-accent text-4xl lg:text-5xl">{hero.name}</motion.span>
                    <motion.span className="text-3xl lg:text-4xl">
                        <TypeAnimation 
                            sequence={['Frontend Developer', 3000, 'Backend Developer', 3000]}  
                            wrapper="div"
                            cursor={true}
                            repeat={Infinity}
                            style={{ fontSize: '1em', display: 'inline-block' }}
                        />
                    </motion.span>
                    <motion.p className="hidden md:block py-2 text-[25px] font-extralight justify-center items-center">{hero.subtitle}</motion.p>
                </motion.div>
                <motion.div className="hero-img min-w-1/4 md:w-1/2" variants={imageVariants}>
                   <motion.img
    src={profile}
    alt="coding illustration"
    className="lgw-[80%] ml-auto"
    style={{ height: 'auto', maxWidth: '85%', float: 'right' }}
    variants={imageVariants}
    initial="initial"
    animate="animate"
/>

                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
