import React from 'react'
import TreeMap, { Tooltip } from 'devextreme-react/tree-map'
import { Paper } from '@material-ui/core';
import { Export, Size } from 'devextreme-react/chart';

const customizeTooltip = (arg) => {
  const data = arg.node.data

  return {
    text: arg.node.isLeaf() ?
      `<span style="font-weight:500;">${data.name}</span><br/>${Math.round(arg.value/1000)} GB` :
      null
  };
}

const LibrarySizeStats = ({ data, type, slice }) => {

  const trimmedSizes = []
  for (const library of data) {
    if (library.type === type) {
      library.items = library.items.sort((a, b) => Number(b.value) - Number(a.value)).slice(0, slice)
      trimmedSizes.push(library)
    }
  }
  const palette = type === 'series' ? ['#008cff', '#d2e8fa'] : ['#fc3503', '#fadad2']
  return (
    <Paper sx={{ p: 2, width: '100%', height: 510 }}>
      <TreeMap
        id="treemap"
        dataSource={trimmedSizes}
        title={`Largest ${slice} ${type === 'series' ? 'Series' : 'Movies'} by Library`}
        colorizer={
          {
            palette,
            colorizeGroups: false
          }
        }
      >
        <Size height={475} />
        <Tooltip
          enabled={true}
          customizeTooltip={customizeTooltip}
        />
        <Export enabled={true} />
      </TreeMap>
    </Paper>
  )
}

export default LibrarySizeStats