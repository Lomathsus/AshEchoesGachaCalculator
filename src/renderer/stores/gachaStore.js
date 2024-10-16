import { flatMapDeep, uniqueId } from 'lodash'
import pools from 'root/assets/data/pool.json'
import { create } from 'zustand/index'
import { immer } from 'zustand/middleware/immer'

import generate30DayIntervals from '@/renderer/utils/calculateDateTime'

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const useGachaStore = create(
  immer((set, get) => ({
    characterList: [],
    memoryTraceList: [],

    gachaCategories: {
      character: [],
      memoryTrace: [],
    },

    gachaCount: {
      character: 0,
      memoryTrace: 0,
    },
    ssrCount: {
      character: 0,
      memoryTrace: 0,
    },

    fetchJsonList: async () => {
      try {
        const fetchCharacter = fetch('/api/act/a20240905record/pc/json/concordant.json')
        const fetchMemoryTrace = fetch('/api/act/a20240905record/pc/json/soldering_mark.json')
        const [characterResponse, memoryTraceResponse] = await Promise.all([fetchCharacter, fetchMemoryTrace])
        // 检查响应是否成功
        if (!characterResponse.ok || !memoryTraceResponse.ok) {
          throw new Error('Network response was not ok')
        }
        // 将响应数据解析为 JSON
        const characterData = await characterResponse.json()
        const memoryTraceData = await memoryTraceResponse.json()

        console.log(characterData)
        console.log(memoryTraceData)

        set((state) => {
          state.characterList = characterData
          state.memoryTraceList = memoryTraceData
        })
      } catch (err) {
        console.error(err)
      }
    },
    fetchGachaList: async (type) => {
      try {
        const dateIntervals = generate30DayIntervals()
        const rawDataList = []
        for (const dateRange of dateIntervals) {
          const res = await window.electron.fetchGachaData({ dateRange, type })
          console.log(res)
          const { code, data } = res
          if (code === 200) {
            rawDataList.push(...Object.values(data))
          }
          if (dateRange !== dateIntervals[dateIntervals.length - 1]) {
            await delay(100)
          }
        }

        const gachaRecords = flatMapDeep(rawDataList).filter((item) => {
          const { poolId } = item
          return Number(poolId) > 11 && Number(poolId) !== 101 && Number(poolId) !== 100
        })
        const ssrRecords = gachaRecords.filter((item) => {
          return type === 'memoryTrace'
            ? get().memoryTraceList[Number(item.tid)].rarity === '3'
            : get().characterList[Number(item.tid)].rarity === '6'
        })

        const classifiedGachaData = gachaRecords.reduce((acc, item) => {
          const { poolId } = item
          const found = acc.find((item) => item.poolId === poolId)
          if (!found) {
            const obj = {
              key: uniqueId('pool-'),
              poolId,
              poolName: pools[poolId.toString()].name,
              tid: pools[poolId.toString()].tid,
              values: [item],
            }
            obj.total = obj.values.length
            acc.push(obj)
          } else {
            found.values.push(item)
            found.total = found.values.length
          }
          return acc
        }, [])

        set((state) => {
          if (type === 'character') {
            state.gachaCount.character = gachaRecords.length
            state.ssrCount.character = ssrRecords.length
            state.gachaCategories.character = classifiedGachaData
          }
          if (type === 'memoryTrace') {
            state.gachaCount.memoryTrace = gachaRecords.length
            state.ssrCount.memoryTrace = ssrRecords.length
            state.gachaCategories.memoryTrace = classifiedGachaData
          }
        })
      } catch (err) {
        console.error(err)
      }
    },
  }))
)

export default useGachaStore
