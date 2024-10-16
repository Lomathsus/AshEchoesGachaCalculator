import { useAsyncEffect, useUpdateEffect } from 'ahooks'
import { Card, Col, Flex, Radio, Row, Statistic, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { useGachaStore } from 'stores'

import { Container } from '@mui/material'

export default function Main() {
  const [tag, setTag] = useState('character')

  const {
    characterList,
    memoryTraceList,
    gachaCategories,
    gachaCount,
    ssrCount,
    fetchGachaList,
    fetchJsonList,
  } = useGachaStore()

  useEffect(() => {
    fetchJsonList()
  }, [])

  useUpdateEffect(() => {
    fetchGachaList(tag)
  }, [characterList, memoryTraceList, tag])

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
      dataIndex: 'accurateSsrCount',
      render: (_, record) => {
        console.log(1, record, record.values)
        const accurateSsrRecords = record.values.filter((item) => Number(item.tid) === Number(record.tid))
        return accurateSsrRecords.length
      },
    },
    {
      title: '歪',
      dataIndex: 'otherSsrCount',
      render: (_, record) => {
        const otherSsrRecords = record.values.filter(
          (item) => memoryTraceList[Number(item.tid)].rarity === '3' && Number(item.tid) !== record.tid
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
        const ssrRecords = record.values.filter((item) => memoryTraceList[item.tid].rarity === '3')
        const ssrRate = ((ssrRecords.length / record.total) * 100).toFixed(2)
        return `${ssrRate}%`
      },
    },
  ]

  return (
    <Container maxWidth="md">
      <Flex vertical gap="middle">
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
              <Statistic title="总抽数" value={gachaCount[tag]} valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic title="SSR" value={ssrCount[tag]} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="出货率"
                value={(ssrCount[tag] / gachaCount[tag]) * 100 || 0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
        {tag === 'character' && (
          <Table
            bordered
            size="small"
            dataSource={gachaCategories.character}
            columns={characterColumns}
            virtual
            scroll={{ y: 370 }}
            pagination={false}
          />
        )}
        {tag === 'memoryTrace' && (
          <Table
            bordered
            size="small"
            dataSource={gachaCategories.memoryTrace}
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
