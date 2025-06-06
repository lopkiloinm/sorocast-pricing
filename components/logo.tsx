interface LogoProps {
  className?: string // Allow external sizing of the crop container
  // iconColor is no longer needed as it's an image
}

/**
 * Renders the telescope image, visually cropped by 10% on all sides.
 * Uses a standard HTML <img> tag with the direct blob URL and CSS for cropping.
 */
export function Logo({ className }: LogoProps) {
  const directBlobUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Jun%202%2C%202025%2C%2012_13_10%20PM-J3sGZq6S07RIg2WP87lDmKEVrBJAqB.png"

  // Crop percentage for all sides
  const cropPercent = 0.1

  // Desired display size for the cropped content (square)
  // This will be the size of the surrounding div.
  // If className provides h-X w-X, those will be used by the div.
  // For calculation, let's assume a default if not provided by className, e.g., 28px.
  // The actual display size will be controlled by the className prop on the div.
  // Let's use a fixed internal calculation based on a typical icon size,
  // and the parent can scale this div if needed, though direct size via className is better.

  // The component will render the cropped image to fit within the container size
  // defined by `className`. If `className` is "h-7 w-7", the container is 28x28.

  // The portion of the image we want to show is the central (1 - 2*cropPercent) part.
  const contentRatio = 1 - 2 * cropPercent // e.g., 1 - 0.2 = 0.8

  // The image needs to be scaled such that its contentRatio part fills the container.
  // So, the scaled full image will be 1/contentRatio times the container size.
  // Example: If container is 28px, scaled full image is 28px / 0.8 = 35px.
  const scaledImageDimension = `calc(100% / ${contentRatio})` // e.g., "calc(100% / 0.8)"

  // The offset to hide the cropped part is cropPercent of the scaled full image.
  // (cropPercent / contentRatio) * 100% of the container size.
  const offset = `calc(-${cropPercent / contentRatio} * 100%)` // e.g., "calc(-0.1 / 0.8 * 100%)" which is -12.5%

  return (
    <div
      className={`relative overflow-hidden ${className || "h-7 w-7"}`} // Default to h-7 w-7 if no className
      style={{
        // Ensure the div is treated as a block or inline-block for sizing
        display: "inline-block", // Or 'block' depending on layout needs
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={directBlobUrl || "/placeholder.svg"}
        alt="Sorocast Telescope Logo"
        style={{
          position: "absolute",
          width: scaledImageDimension,
          height: scaledImageDimension,
          left: offset,
          top: offset,
          maxWidth: "none", // Important to prevent image from being constrained
          objectFit: "cover", // Ensure image covers the scaled dimensions
        }}
      />
    </div>
  )
}
