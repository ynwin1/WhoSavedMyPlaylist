import React from "react";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-colors duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
                {icon}
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-white/70">{description}</p>
            </div>
        </div>
    );
}

export default FeatureCard;