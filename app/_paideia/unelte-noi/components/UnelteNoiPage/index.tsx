'use client';

import IndexLayout from '@/components/IndexLayout';

import {
    course,
} from '../../data';



export default function UnelteNoiPage() {
    return (
        <IndexLayout
            title={course.title}
            description={course.tagline}
        >
            <div className="w-full max-w-xl px-6 pb-24">
                {/* Promise */}
                <div className="mb-16 text-center">
                    <div className="text-base uppercase tracking-wider font-bold">
                        {course.promise}
                    </div>
                </div>

                {/* Intro */}
                <p className="mb-16 text-sm leading-relaxed">
                    {course.intro}
                </p>

                {/* Audience */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase mb-4">Pentru cine</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <div className="uppercase text-xs mb-1">
                                {course.audience.copii.label}
                            </div>
                            <div>
                                {course.audience.copii.body}
                            </div>
                        </div>
                        <div>
                            <div className="uppercase text-xs mb-1">
                                {course.audience.adulti.label}
                            </div>
                            <div>
                                {course.audience.adulti.body}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mastery */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase mb-4">Cele trei niveluri</h2>
                    <ul className="space-y-2 text-sm">
                        {course.mastery.map((layer) => (
                            <li key={layer.layer}>
                                <span className="uppercase">
                                    {layer.layer}
                                </span>
                                <span>
                                    {': '}{layer.body}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Structure */}
                <section className="mb-16 text-sm leading-relaxed">
                    Cursul are {course.structure.modules} de module,
                    în total {course.structure.episodes} de episoade scurte,
                    fiecare aproximativ 10 minute, organizate pe șase trasee.
                </section>

                {/* Tracks */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase mb-4">Cele șase trasee</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.tracks.map((track) => (
                            <div
                                key={track.slug}
                                className="border border-lime-500/30 hover:border-lime p-4 transition-colors"
                            >
                                <div className="uppercase text-xs mb-2">
                                    {track.name}
                                </div>
                                <div className="text-xs leading-relaxed">
                                    {track.body}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </IndexLayout>
    );
}
