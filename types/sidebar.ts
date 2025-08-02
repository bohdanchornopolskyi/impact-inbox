export interface Layer {
  id: string
  name: string
  type: "page" | "frame" | "text" | "image" | "button"
  visible: boolean
  children?: Layer[]
}

export interface Component {
  id: string
  name: string
  category: string
}

export interface Asset {
  id: string
  name: string
  type: string
  size: string
}
