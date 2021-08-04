import React from 'react';
import { useParams } from 'react-router-dom';
import { MovieService } from '../services';

const Movie = () => {
  const { uuid } = useParams()
  const [movie, setMovie] = React.useState({})

  React.useEffect(() => {
    async function fetch() {
      const resp = (await MovieService.getByUuid(uuid)).data
      console.log(resp)
      setMovie(resp)
    }
    fetch()
  }, [uuid])

  return (
    <div>
      {JSON.stringify(movie)}    
    </div>
  )
}

export default Movie