import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';

export default function FirstPost() {
    return (
        <>
            <Head>
                <h1>First Post</h1>
            </Head>
            <h2>
                <Link href="/">Back to Home</Link>
            </h2>
        </>
    );
}

const YourComponent = () => (
    <Image
        src="/images/profile.jpg" // Route of the image file
        height={144} // Desired size with correct aspect ratio
        width={144} // Desired size with correct aspect ratio
        alt="Your Name"
    />
);