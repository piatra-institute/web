import { documentIcon } from '@/data/icons';


export interface PolicyDownloadItem {
    label: string;
    href: string;
    description?: string;
    external?: boolean;
}


interface PolicyDownloadsProps {
    items: PolicyDownloadItem[];
    heading?: string;
}


export default function PolicyDownloads({
    items,
    heading = 'downloads',
}: PolicyDownloadsProps) {
    return (
        <section
            id="downloads"
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 uppercase tracking-wide">
                <a href="#downloads" className="hover:underline">{heading}</a>
            </h2>

            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="border-t border-white/20 pt-3">
                        <a
                            href={item.href}
                            className="inline-flex items-center gap-2 text-sm md:text-base underline underline-offset-4 hover:text-white focus:outline-none focus:ring-1 focus:ring-white"
                            target={item.external ? '_blank' : undefined}
                            rel={item.external ? 'noopener noreferrer' : undefined}
                            download={!item.external || undefined}
                            aria-label={`download ${item.label}`}
                        >
                            <span aria-hidden="true" className="inline-flex shrink-0">
                                {documentIcon}
                            </span>
                            <span>{item.label}</span>
                        </a>
                        {item.description && (
                            <div className="text-xs md:text-sm text-white/65 mt-1">
                                {item.description}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
