import { useUpdateEffect } from 'ahooks'
import { Card, Col, Flex, Radio, Row, Statistic, Table } from 'antd'
import { flatMapDeep, uniqueId } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'

import { Container } from '@mui/material'

import pools from '../../../../assets/data/pool.json'
import { cookie } from '../../../main/constant'
import generate30DayIntervals from './utils/calculateDateTime'

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default function Main() {
  const [characterList, setCharacterList] = useState([])
  const [memoryTraceList, setMemoryTraceList] = useState([])
  const [gachaCategories, setGachaCategories] = useState([])
  const [gachaCount, setGachaCount] = useState(0)
  const [ssrCount, setSsrCount] = useState(0)

  const [tag, setTag] = useState('character')

  useEffect(() => {
    const fetchGachaList = async () => {
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

        setCharacterList(characterData)
        setMemoryTraceList(memoryTraceData)
      } catch (err) {
        console.error(err)
      }
    }

    fetchGachaList()
  }, [])

  useUpdateEffect(() => {
    const getGachaData = async (type) => {
      try {
        const dateIntervals = generate30DayIntervals()
        const rawDataList = []
        for (const dateRange of dateIntervals) {
          const res = await window.jsBridge.fetch.fetchGachaData({ dateRange, type, cookie })
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
            ? memoryTraceList[Number(item.tid)].rarity === '3'
            : characterList[Number(item.tid)].rarity === '6'
        })
        setGachaCount(gachaRecords.length)
        setSsrCount(ssrRecords.length)

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

        setGachaCategories(classifiedGachaData)
      } catch (err) {
        console.error(err)
      }
    }
    getGachaData(tag)
  }, [memoryTraceList, tag])

  const characterColumns = [
    {
      title: '卡池',
      dataIndex: 'poolName',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'poolName',
      render: (_, record) => {
        if (characterList) {
          return characterList[record.tid]['name']
        }
        return '-'
      },
    },
    {
      title: '当期UP',
      dataIndex: 'currentCharacterCount',
      render: (_, record) => {
        const accurateSsrRecords = record.values.filter((item) => Number(item.tid) === record.tid)
        return accurateSsrRecords.length
      },
    },
    {
      title: '歪',
      dataIndex: 'otherCharacterCount',
      render: (_, record) => {
        const otherSsrRecords = record.values.filter(
          (item) => characterList[item.tid].rarity === '6' && Number(item.tid) !== record.tid
        )
        return otherSsrRecords.length
      },
    },
    {
      title: '总抽数',
      dataIndex: 'total',
    },
    {
      title: '出货率',
      dataIndex: 'rate',
      render: (_, record) => {
        const ssrRecords = record.values.filter((item) => characterList[item.tid].rarity === '6')
        const ssrRate = ((ssrRecords.length / record.total) * 100).toFixed(2)
        return `${ssrRate}%`
      },
    },
  ]

  const memoryTraceColumns = [
    {
      title: '卡池',
      dataIndex: 'poolName',
      width: 180,
    },
    {
      title: '当期UP',
      dataIndex: 'currentCharacterCount',
      render: (_, record) => {
        const accurateSsrRecords = record.values.filter((item) => Number(item.tid) === record.tid)
        return accurateSsrRecords.length
      },
    },
    {
      title: '歪',
      dataIndex: 'otherCharacterCount',
      render: (_, record) => {
        const otherSsrRecords = record.values.filter(
          (item) => memoryTraceList[item.tid].rarity === '3' && Number(item.tid) !== record.tid
        )
        return otherSsrRecords.length
      },
    },
    {
      title: '总抽数',
      dataIndex: 'total',
    },
    {
      title: '出货率',
      dataIndex: 'rate',
      render: () => {
        const ssrRate = ((ssrCount / gachaCount) * 100).toFixed(2)
        return `${ssrRate}%`
      },
    },
  ]

  // useUpdateEffect(() => {
  //   const getCharacterGachaData = async () => {
  //     try {
  //       const dateIntervals = generate30DayIntervals()
  //       const rawDataList = []
  //       for (const dateRange of dateIntervals) {
  //         const res = await window.jsBridge.fetch.fetchGachaData({ dateRange, type: 'character', cookie })
  //         const { code, data } = res
  //         if (code === 200) {
  //           rawDataList.push(...Object.values(data))
  //         }
  //         if (dateRange !== dateIntervals[dateIntervals.length - 1]) {
  //           await delay(100)
  //         }
  //       }
  //       const characterGachaRecords = flatMapDeep(rawDataList).filter((item) => {
  //         const { poolId } = item
  //         return Number(poolId) > 11 && Number(poolId) !== 101 && Number(poolId) !== 100
  //       })
  //       const characterSsrRecords = characterGachaRecords.filter(
  //         (item) => characterList[Number(item.tid)].rarity === '6'
  //       )
  //       setGachaCount(characterGachaRecords.length)
  //       setSsrCount(characterSsrRecords.length)
  //
  //       const classifiedGachaData = characterGachaRecords.reduce((acc, item) => {
  //         const { poolId } = item
  //         const found = acc.find((item) => item.poolId === poolId)
  //         if (!found) {
  //           const obj = {
  //             key: uniqueId('pool-'),
  //             poolId,
  //             poolName: pools[poolId.toString()].name,
  //             tid: pools[poolId.toString()].tid,
  //             values: [item],
  //           }
  //           obj.total = obj.values.length
  //           acc.push(obj)
  //         } else {
  //           found.values.push(item)
  //           found.total = found.values.length
  //         }
  //         return acc
  //       }, [])
  //
  //       setGachaCategories(classifiedGachaData)
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }
  //   getCharacterGachaData()
  // }, [characterList])

  return (
    <Container maxWidth="md">
      <Flex vertical gap="middle">
        <button
          onClick={() => {
            window.electron.send('open-auth-window')
          }}
        >
          Open Auth Window
        </button>
        <Radio.Group
          block
          optionType="button"
          onChange={(e) => {
            setTag(e.target.value)
          }}
          buttonStyle="solid"
          defaultValue="character"
        >
          <Radio.Button value="character">角色</Radio.Button>
          <Radio.Button value="memoryTrace">烙痕</Radio.Button>
        </Radio.Group>
        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="总抽数" value={gachaCount} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="SSR" value={ssrCount} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="出货率"
                value={(ssrCount / gachaCount) * 100 || 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
        {tag.current === 'character' && (
          <Table
            bordered
            size="small"
            dataSource={gachaCategories}
            columns={characterColumns}
            virtual
            scroll={{ y: 370 }}
            pagination={false}
          />
        )}
        {tag.current === 'memoryTrace' && (
          <Table
            bordered
            size="small"
            dataSource={gachaCategories}
            columns={memoryTraceColumns}
            virtual
            scroll={{ y: 370 }}
            pagination={false}
          />
        )}
      </Flex>
    </Container>
  )
}
