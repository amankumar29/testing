import React from 'react'

const ResponseHeader = ({response}) => {

  return (
    <div className='w-[980px] h-[324px] bg-ibl32 rounded-md overflow-y-auto mb-4 p-4 mt-[10px]'>
      <div className='flex gap-6 text-igy1 font-medium text-sm leading-5'>
      <div className='w-1/4'>Key</div>
      <div className='w-1/2'>Value</div>
      </div>
      <div className='mt-2'>
        {
            Object.entries(response?.headers).map(([key, value], index) => (
                <div className='flex gap-6 text-igy1 font-medium text-sm leading-5 py-1' key={index}>
                    <div className='w-1/4'>{key}</div>
                    <div className='w-1/2'>{value}</div>
                </div>
            ))
        }
      </div>
    </div>
  )
}

export default ResponseHeader
