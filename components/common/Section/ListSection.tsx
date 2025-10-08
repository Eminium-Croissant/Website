import { ReactNode } from "react";
import Section from "./Section";

type ListSectionProps = {
    title: string;
    description?: string;
    items: ReactNode[];
};

export default function ListSection({ title, description, items }: ListSectionProps) {
    return (
        <Section title={title}>
            {description && (
                <p className="text-[#bdbdbd] mb-4">
                    {description}
                </p>
            )}
            <ul className="list-disc pl-5 space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="text-[#bdbdbd]">
                        {item}
                    </li>
                ))}
            </ul>
        </Section>
    );
}