"use client";

import ErrorElement from "@/components/feedback/error/ErrorElement";

export default function ErrorPage({ error }: { error: Error }) {
    return <ErrorElement message={error?.message} />;
}
