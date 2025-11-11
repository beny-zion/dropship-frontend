import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="relative w-96 h-96">
        <Image
          src="/loading.gif"
          alt="טוען..."
          width={384}
          height={384}
          priority
          unoptimized
          className="object-contain"
        />
      </div>
      <p className="mt-8 text-gray-800 text-2xl font-light animate-pulse tracking-wide">
        טוען את העמוד...
      </p>
    </div>
  );
}
