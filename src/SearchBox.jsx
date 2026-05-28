import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import "./searchBox.css"
import { useState } from 'react';

//material ui for templete 
export default function SearchBox({
  onSearch,
  onUseCurrentLocation,
  onUnitChange,
  currentUnit,
  recentSearches,
  onRecentSearch,
  loading,
  error,
}){
    let [city,setCity]=useState("");

  function clearQuery(){
   setCity("");
  }

   function handleInput(event){
    setCity(event.target.value);
   }



   let handleSubmit=async(event)=>{
   try{
     event.preventDefault();
    if (!city.trim()) {
      return
    }

    await onSearch(city.trim())
    clearQuery();
   }catch(error)
   {
    console.error(error)
   }
   
   }

    return(
    <>
    <div className='searchBox'>
      <div className='searchTopRow'>
        <div className='searchTitleBlock'>
          <span className='searchKicker'>Weather search</span>
          <h3>Check a city instantly</h3>
        </div>

        <ToggleButtonGroup
          className='unitToggle compactToggle'
          value={currentUnit}
          exclusive
          onChange={(_, nextUnit) => {
            if (nextUnit) {
              onUnitChange(nextUnit)
            }
          }}
          aria-label="Temperature unit"
          size="small"
          disabled={loading}
        >
          <ToggleButton value="metric">Celsius</ToggleButton>
          <ToggleButton value="imperial">Fahrenheit</ToggleButton>
        </ToggleButtonGroup>
      </div>

       <form className='searchForm' onSubmit={handleSubmit} >
        <TextField
          id="city"
          label="City name"
          variant="outlined"
          required
          value={city}
          onChange={handleInput}
          fullWidth
          size="medium"
          placeholder="Enter a city like Tokyo or Kathmandu"
          disabled={loading}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} className='actionRow'>
          <Button type='submit' variant="contained" disabled={loading} fullWidth>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button type='button' variant="outlined" onClick={onUseCurrentLocation} disabled={loading} fullWidth>
            Use current location
          </Button>
        </Stack>
         </form>

       {error && <p className='searchError'>{error}</p>}

       {recentSearches.length > 0 && (
        <div className='recentSearches'>
          <p>Recent places</p>
          <div className='recentChipRow'>
            {recentSearches.map((recentCity) => (
              <Chip
                key={recentCity}
                label={recentCity}
                onClick={() => onRecentSearch(recentCity)}
                variant="outlined"
                disabled={loading}
              />
            ))}
          </div>
        </div>
       )}

    </div>
    </>
    )
}