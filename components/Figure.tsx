import Image from './Image';

interface FigureProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export default function Figure({ src, alt, width, height, caption }: FigureProps) {
  return (
    <figure className="my-6">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="mx-auto h-auto w-full rounded-lg border border-gray-200 dark:border-gray-700"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
