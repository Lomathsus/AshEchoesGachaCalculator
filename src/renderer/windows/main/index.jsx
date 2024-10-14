import { Card, Col, Flex, Row, Statistic, Table } from 'antd'
import { flatMapDeep } from 'lodash'
import React, { useEffect, useState } from 'react'

import { Container } from '@mui/material'

import pools from '../../../../assets/data/pool.json'
import { cookie } from './constant'
import generate30DayIntervals from './utils/calculateDateTime'

// eslint-disable-next-line max-params
function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default function Main() {
  const [characterList, setCharacterList] = useState([])
  const [memoryTraceList, setMemoryTraceList] = useState([])
  const [characterGachaList, setCharacterGachaList] = useState([])
  const [characterGachaCount, setCharacterGachaCount] = useState(0)
  const [characterSsrCount, setCharacterSsrCount] = useState(0)

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

        // const processedPoolData = Object.entries(poolData).reduce(
        //   (accumulator, currentValue) => {
        //     const [key, value] = currentValue
        //     if (value.type === '1') {
        //       accumulator['character'][key] = value.name
        //       return accumulator
        //     }
        //     if (value.type === '2') {
        //       accumulator['memoryTrace'][key] = value.name
        //       return accumulator
        //     }
        //     accumulator['common'][key] = value.name
        //     return accumulator
        //   },
        //   { common: {}, character: {}, memoryTrace: {} }
        // )

        console.log(characterData)
        console.log(memoryTraceData)

        setCharacterList(characterData)
        setMemoryTraceList(memoryTraceData)

        const dateIntervals = generate30DayIntervals()
        const rawDataList = []
        for (const dateRange of dateIntervals) {
          const res = await window.jsBridge.fetch.fetchGachaData({ dateRange, cookie })
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
        const ssrRecords = gachaRecords.filter((item) => characterData[Number(item.tid)].rarity === '6')
        setCharacterGachaCount(gachaRecords.length)
        setCharacterSsrCount(ssrRecords.length)

        const gachaData = gachaRecords.reduce((acc, item) => {
          const { poolId } = item

          if (!acc[poolId]) {
            acc[poolId] = []
          }
          acc[poolId].push(item)
          return acc
        }, {})
        const list = []
        Object.entries(gachaData).forEach(([key, value], index) => {
          list.push({
            key: `pool-${index}`,
            poolId: key,
            poolName: pools[key.toString()].name,
            tid: pools[key.toString()].tid,
            values: value,
            total: value.length,
          })
        })
        setCharacterGachaList(list)
      } catch (err) {
        console.error(err)
      }
    }

    fetchGachaList()
  }, [])

  const columns = [
    {
      title: '卡池',
      dataIndex: 'poolName',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'poolName',
      render: (_, record) => {
        return characterList[record.tid]['name']
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

  return (
    <Container maxWidth="md">
      <Flex vertical gap="middle">
        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="总抽数" value={characterGachaCount} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="SSR" value={characterSsrCount} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="出货率"
                value={(characterSsrCount / characterGachaCount) * 100 || 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
        <Table
          bordered
          size="small"
          dataSource={characterGachaList}
          columns={columns}
          virtual
          scroll={{ y: 370 }}
          pagination={false}
        />
      </Flex>
    </Container>
  )
}
