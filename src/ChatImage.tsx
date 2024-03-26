interface Props {
  src: string
  width?: string
  height?: string
  onClick?: (src: string) => void
}

export default function ChatImage({
  src,
  width = "auto",
  height = "40px",
  onClick = () => {},
}: Props) {
  return (
    <img
      src={src}
      style={{ height, width }}
      onClick={() => onClick && onClick(src)}
      className="rounded-lg transition-all hover:cursor-pointer hover:scale-150 hover:shadow-md"
    />
  )
}
