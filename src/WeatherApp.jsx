import { useCallback, useEffect, useState } from "react"
import InfoBox from "./InfoBox"
import SearchBox from "./SearchBox"

const API_URL = import.meta.env.VITE_WEATHER_URL ?? ""
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY ?? ""
const DEFAULT_CITY = "Kathmandu"
const RECENT_SEARCHES_KEY = import.meta.env.VITE_WEATHER_SEARCH_KEY ?? "recentSearches"

function buildWeatherInfo(jsonResponse, cityName) {
    const primaryWeather = jsonResponse.weather?.[0] ?? {}

    return {
        city: jsonResponse.name || cityName,
        country: jsonResponse.sys?.country || "",
        temp: jsonResponse.main?.temp,
        tempMin: jsonResponse.main?.temp_min,
        tempMax: jsonResponse.main?.temp_max,
        feelsLike: jsonResponse.main?.feels_like,
        humidity: jsonResponse.main?.humidity,
        weather: primaryWeather.description || "Unknown",
        weatherMain: primaryWeather.main || "Clear",
        icon: primaryWeather.icon || "",
        windSpeed: jsonResponse.wind?.speed,
        pressure: jsonResponse.main?.pressure,
        visibility: jsonResponse.visibility,
        sunrise: jsonResponse.sys?.sunrise,
        sunset: jsonResponse.sys?.sunset,
    }
}



export default function WeatherApp(){
    const [weatherInfo, setWeatherInfo] = useState({
        city: DEFAULT_CITY,
        country: "NP",
        temp: 15.12,
        tempMin: 15.12,
        tempMax: 15.12,
        feelsLike: 14.2,
        humidity: 55,
        weather: "few clouds",
        weatherMain: "Clouds",
        icon: "",
        windSpeed: 0,
        pressure: 0,
        visibility: 0,
        sunrise: null,
        sunset: null,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [unit, setUnit] = useState("metric")
    const [recentSearches, setRecentSearches] = useState([])
    const [lastUpdated, setLastUpdated] = useState(null)

    const storeRecentSearch = useCallback((cityName) => {
        const normalizedCity = cityName.trim()

        if (!normalizedCity) {
            return
        }

        setRecentSearches((currentCities) => {
            const nextCities = [normalizedCity, ...currentCities.filter((city) => city.toLowerCase() !== normalizedCity.toLowerCase())].slice(0, 5)
            window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextCities))
            return nextCities
        })
    }, [])

    const fetchWeatherByCity = async (cityName, requestedUnit, shouldStoreSearch = true) => {
        if (!API_URL || !API_KEY) {
            setError("Weather API not configured. Set VITE_WEATHER_URL and VITE_WEATHER_API_KEY.")
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await fetch(
                `${API_URL}?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=${requestedUnit}`
            )
            const jsonResponse = await response.json()

            if (!response.ok) {
                throw new Error(jsonResponse.message || "Unable to find that city")
            }

            const nextWeatherInfo = buildWeatherInfo(jsonResponse, cityName)
            setWeatherInfo(nextWeatherInfo)
            setUnit(requestedUnit)
            setLastUpdated(new Date())

            if (shouldStoreSearch) {
                storeRecentSearch(nextWeatherInfo.city)
            }
        } catch (fetchError) {
            setError(fetchError.message || "No such place exists.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const savedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY)

        if (savedSearches) {
            try {
                setRecentSearches(JSON.parse(savedSearches))
            } catch {
                setRecentSearches([])
            }
        }

        void fetchWeatherByCity(DEFAULT_CITY, "metric", false)
        // Intentionally run only once so unit changes don't reset the default city.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchWeatherByCoordinates = async (latitude, longitude) => {
        if (!API_URL || !API_KEY) {
            setError("Weather API not configured. Set VITE_WEATHER_URL and VITE_WEATHER_API_KEY.")
            return
        }

        try {
            setLoading(true)
            setError("")

            const response = await fetch(
                `${API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${unit}`
            )
            const jsonResponse = await response.json()

            if (!response.ok) {
                throw new Error(jsonResponse.message || "Unable to load your location")
            }

            const nextWeatherInfo = buildWeatherInfo(jsonResponse, jsonResponse.name)
            setWeatherInfo(nextWeatherInfo)
            setLastUpdated(new Date())
            storeRecentSearch(nextWeatherInfo.city)
        } catch (fetchError) {
            setError(fetchError.message || "Unable to load your location")
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (cityName) => {
        return fetchWeatherByCity(cityName, unit)
    }

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported in this browser.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                void fetchWeatherByCoordinates(position.coords.latitude, position.coords.longitude)
            },
            () => {
                setError("Location access was blocked. Please search manually.")
            }
        )
    }

    const handleUnitChange = (nextUnit) => {
        if (nextUnit === unit) {
            return
        }

        void fetchWeatherByCity(weatherInfo.city, nextUnit, false)
    }

    const handleRecentSearch = (cityName) => {
        void fetchWeatherByCity(cityName, unit)
    }

    const formattedLastUpdated = lastUpdated
        ? lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : "--"

    return(
        <div className="weather-app-shell">
            <SearchBox
                onSearch={handleSearch}
                onUseCurrentLocation={handleUseCurrentLocation}
                onUnitChange={handleUnitChange}
                currentUnit={unit}
                recentSearches={recentSearches}
                onRecentSearch={handleRecentSearch}
                loading={loading}
                error={error}
            />

            <InfoBox
                info={weatherInfo}
                loading={loading}
                error={error}
                unit={unit}
                lastUpdated={formattedLastUpdated}
            />
        </div>
    )
}