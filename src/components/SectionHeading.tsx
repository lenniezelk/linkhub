import React from 'react';

interface SectionHeadingProps {
    title: string;
    className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, className = '' }) => {
    return (
        <>
            <h2 className={`text-2xl font-semibold mt-12 text-gray-400 ${className}`}>{title}</h2>
            <hr className="w-full max-w-md border-gray-200 mt-4" />
        </>
    );
};

export default SectionHeading;