import React, {
  createContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react'
import * as mapboxgl from 'mapbox-gl'
import type { LngLatLike, LngLatBoundsLike } from 'mapbox-gl'

export const MapboxContext = createContext(null)

export const useMapbox = () => {
  return useContext(MapboxContext)
}

type Props = {
  zoom?: number
  minZoom?: number
  maxZoom?: number
  maxBounds?: LngLatBoundsLike
  center?: LngLatLike
  debug?: boolean
  glyphs?: string
  children?: React.Node
  style?: { [key: string]: string }
}

const Mapbox = ({
  glyphs,
  style,
  center,
  zoom,
  minZoom,
  maxZoom,
  maxBounds,
  debug,
  children,
}: Props) => {
  const map = useRef()
  const [ready, setReady] = useState()

  const ref = useCallback((node) => {
    const mapboxStyle = {
      version: 8,
      sources: {},
      layers: [],
      ...(glyphs ? { glyphs } : {}),
    }
    if (node !== null) {
      map.current = new mapboxgl.Map({
        container: node,
        style: mapboxStyle,
        minZoom: minZoom,
        maxZoom: maxZoom,
        maxBounds: maxBounds,
        dragRotate: false,
        pitchWithRotate: false,
        touchZoomRotate: true,
      })
      if (center) map.current.setCenter(center)
      if (zoom) map.current.setZoom(zoom)
      map.current.touchZoomRotate.disableRotation()
      map.current.touchPitch.disable()
      map.current.on('styledata', () => {
        setReady(true)
      })
    }
  }, [])

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove()
        setReady(false)
      }
    }
  }, [])

  useEffect(() => {
    map.current.showTileBoundaries = debug
  }, [debug])

  return (
    <MapboxContext.Provider
      value={{
        map: map.current,
      }}
    >
      <div
        style={{
          top: '0px',
          bottom: '0px',
          position: 'absolute',
          width: '100%',
          ...style,
        }}
        ref={ref}
      />
      {ready && children}
    </MapboxContext.Provider>
  )
}

export default Mapbox
