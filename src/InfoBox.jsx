import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import "./infoBox.css"
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import CompressIcon from '@mui/icons-material/Compress';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ScheduleIcon from '@mui/icons-material/Schedule';

function formatTime(unixTimestamp) {
  if (!unixTimestamp) {
    return "--"
  }

  return new Date(unixTimestamp * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })
}

function getThemeClass(info) {
  if (info.humidity > 80 || /rain|drizzle|thunderstorm/i.test(info.weatherMain || info.weather)) {
    return "storm"
  }

  if ((info.temp ?? 0) > 22) {
    return "sunny"
  }

  return "cool"
}



export default function InfoBox({info, loading, error, unit, lastUpdated}) {
  const unitLabel = unit === "metric" ? "C" : "F"
  const windLabel = unit === "metric" ? "m/s" : "mph"
  const themeClass = getThemeClass(info)
  const weatherIconUrl = info.icon
    ? `https://openweathermap.org/img/wn/${info.icon}@4x.png`
    : ""

  return (
    <div className='infoBox'>
      <div className='cardContainer'>
        <Card className={`weatherCard ${themeClass}`}>
          <Box className='weatherCardTop'>
            <div>
              <Typography variant="overline" className='locationBadge'>
                {info.country ? `${info.city}, ${info.country}` : info.city}
              </Typography>
              <Typography variant="h4" component="h2" className='cityTitle'>
                {info.city}
              </Typography>
              <Typography variant="body2" className='weatherSubtitle'>
                {info.weather}
              </Typography>
            </div>

            <div className='weatherIconWrap'>
              {weatherIconUrl ? (
                <img
                  src={weatherIconUrl}
                  alt={info.weather || "Weather icon"}
                  className='weatherConditionIcon'
                />
              ) : (
                <span className='weatherFallbackIcon'>--</span>
              )}
            </div>
          </Box>

          {loading && <LinearProgress className='weatherLoadingBar' />}

          <CardContent className='weatherContent'>
            {error ? (
              <Box className='errorState'>
                <Typography variant="h6" component="p">
                  Weather data could not be loaded.
                </Typography>
                <Typography variant="body2">
                  Try another city or enable location access.
                </Typography>
              </Box>
            ) : (
              <>
                <Box className='temperatureBlock'>
                  <Typography variant="h2" component="p" className='temperatureValue'>
                    {Math.round(info.temp)}&deg;{unitLabel}
                  </Typography>
                  <Typography variant="body2" className='temperatureHint'>
                    Feels like {Math.round(info.feelsLike)}&deg;{unitLabel}
                  </Typography>
                </Box>

                <Box className='statsGrid'>
                  <Box className='statCard'>
                    <WaterDropIcon />
                    <div>
                      <span>Humidity</span>
                      <strong>{info.humidity}%</strong>
                    </div>
                  </Box>
                  <Box className='statCard'>
                    <AirIcon />
                    <div>
                      <span>Wind</span>
                      <strong>{info.windSpeed} {windLabel}</strong>
                    </div>
                  </Box>
                  <Box className='statCard'>
                    <CompressIcon />
                    <div>
                      <span>Pressure</span>
                      <strong>{info.pressure} hPa</strong>
                    </div>
                  </Box>
                  <Box className='statCard'>
                    <VisibilityIcon />
                    <div>
                      <span>Visibility</span>
                      <strong>{info.visibility ? `${Math.round(info.visibility / 1000)} km` : "--"}</strong>
                    </div>
                  </Box>
                </Box>

                <Divider className='weatherDivider' />

                <Box className='rangeGrid'>
                  <div>
                    <span>Min</span>
                    <strong>{Math.round(info.tempMin)}&deg;{unitLabel}</strong>
                  </div>
                  <div>
                    <span>Max</span>
                    <strong>{Math.round(info.tempMax)}&deg;{unitLabel}</strong>
                  </div>
                  <div>
                    <span>Sunrise</span>
                    <strong><ScheduleIcon /> {formatTime(info.sunrise)}</strong>
                  </div>
                  <div>
                    <span>Sunset</span>
                    <strong><ScheduleIcon /> {formatTime(info.sunset)}</strong>
                  </div>
                </Box>

                <Typography variant="body2" className='lastUpdated'>
                  Last updated: {lastUpdated}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
