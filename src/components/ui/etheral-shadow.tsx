'use client';

import React, { useRef, useId, useEffect, CSSProperties } from 'react';
import { animate, useMotionValue, AnimationPlaybackControls } from 'framer-motion';

// Type definitions
interface AnimationConfig {
    scale: number;
    speed: number;
}

interface NoiseConfig {
    opacity: number;
    scale: number;
}

interface EtherealShadowProps {
    sizing?: 'fill' | 'stretch';
    color?: string;
    animation?: AnimationConfig;
    noise?: NoiseConfig;
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
}

function mapRange(
    value: number,
    fromLow: number,
    fromHigh: number,
    toLow: number,
    toHigh: number
): number {
    if (fromLow === fromHigh) {
        return toLow;
    }
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

const useInstanceId = (): string => {
    const id = useId();
    const cleanId = id.replace(/:/g, "");
    return `ethereal-${cleanId}`;
};

export function EtherealShadow({
    color = 'rgba(16, 185, 129, 1)',
    animation,
    noise,
    style,
    className,
    children
}: EtherealShadowProps) {
    const id = useInstanceId();
    const animationEnabled = animation && animation.scale > 0;
    const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
    const hueRotateMotionValue = useMotionValue(0);
    const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

    const displacementScale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0;
    const animationDuration = animation ? mapRange(animation.speed, 1, 100, 30, 5) : 10;

    useEffect(() => {
        if (feColorMatrixRef.current && animationEnabled) {
            if (hueRotateAnimation.current) {
                hueRotateAnimation.current.stop();
            }
            hueRotateMotionValue.set(0);
            hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
                duration: animationDuration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                onUpdate: (value: number) => {
                    if (feColorMatrixRef.current) {
                        feColorMatrixRef.current.setAttribute("values", String(value));
                    }
                }
            });

            return () => {
                if (hueRotateAnimation.current) {
                    hueRotateAnimation.current.stop();
                }
            };
        }
    }, [animationEnabled, animationDuration, hueRotateMotionValue]);

    return (
        <div
            className={className}
            style={{
                overflow: "hidden",
                position: "relative",
                width: "100%",
                height: "100%",
                background: "#0a0a0a",
                ...style
            }}
        >
            {/* SVG Filter Definition */}
            {animationEnabled && (
                <svg style={{ position: "absolute", width: 0, height: 0 }}>
                    <defs>
                        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
                            <feTurbulence
                                result="undulation"
                                numOctaves="3"
                                baseFrequency={`${mapRange(animation.scale, 0, 100, 0.002, 0.001)},${mapRange(animation.scale, 0, 100, 0.004, 0.002)}`}
                                seed="0"
                                type="fractalNoise"
                            />
                            <feColorMatrix
                                ref={feColorMatrixRef}
                                in="undulation"
                                type="hueRotate"
                                values="0"
                            />
                            <feColorMatrix
                                result="circulation"
                                type="matrix"
                                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="circulation"
                                scale={displacementScale}
                                result="dist"
                            />
                            <feGaussianBlur stdDeviation="2" />
                        </filter>
                    </defs>
                </svg>
            )}

            {/* Animated Background Layer */}
            <div
                style={{
                    position: "absolute",
                    inset: animationEnabled ? -displacementScale * 2 : 0,
                    filter: animationEnabled ? `url(#${id})` : "none",
                }}
            >
                {/* Multiple gradient orbs for ethereal effect */}
                <div
                    style={{
                        position: "absolute",
                        top: "10%",
                        left: "20%",
                        width: "60vw",
                        height: "60vh",
                        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
                        opacity: 0.6,
                        transform: "rotate(-15deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "10%",
                        right: "10%",
                        width: "50vw",
                        height: "50vh",
                        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
                        opacity: 0.4,
                        transform: "rotate(30deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "40%",
                        left: "50%",
                        width: "40vw",
                        height: "40vh",
                        background: `radial-gradient(ellipse at center, ${color.replace('1)', '0.8)')} 0%, transparent 60%)`,
                        opacity: 0.5,
                        transform: "translate(-50%, -50%)",
                    }}
                />
            </div>

            {/* Dark overlay for better text readability */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)",
                    pointerEvents: "none",
                }}
            />

            {/* Children content */}
            {children && (
                <div
                    style={{
                        position: "relative",
                        zIndex: 10,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {children}
                </div>
            )}

            {/* Noise overlay */}
            {noise && noise.opacity > 0 && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundSize: `${noise.scale * 200}px`,
                        backgroundRepeat: "repeat",
                        opacity: noise.opacity * 0.15,
                        pointerEvents: "none",
                        mixBlendMode: "overlay",
                    }}
                />
            )}
        </div>
    );
}

