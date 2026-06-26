let promise = null

export function loadGoogleMaps() {
  if (typeof window === 'undefined') return Promise.resolve()

  if (window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve()
  }

  if (promise) return promise

  promise = new Promise(function(resolve, reject) {
    var script = document.createElement('script')
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY + '&libraries=places&language=he'
    script.async = true
    script.onload = function() { resolve() }
    script.onerror = function() { reject(new Error('Google Maps failed to load')) }
    document.head.appendChild(script)
  })

  return promise
}
