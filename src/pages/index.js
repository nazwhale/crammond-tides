import * as React from "react"
import {useEffect, useState} from "react";
import { Stack, Heading, Box, Text, ListItem, UnorderedList, Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup, Tooltip, Skeleton, Link } from "@chakra-ui/react"

// type DataItem = {
//   @id: string
//   dateTime: string
//   measure: string
//   value: float
// }

const listItemStyles = {
  fontSize: 24, // For the bullets
  maxWidth: 560,
  marginBottom: 30,
}

const linkStyle = {
  color: "#8954A8",
}

const IndexPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const request = await fetch("https://environment.data.gov.uk/flood-monitoring/id/stations/E70839/readings.json?_limit=100&_sorted");
      const data = await request.json();
      setData(data.items)
    };

    if (data == null) {
      getData()
    }
  })

  return (
    <Box as="main" marginX={[4, 50, 50, 100]} marginY={[4, 50, 50, 70]}>
      <title>Home Page</title>

    <Stack spacing={12}>
      <Box>
      <Heading><span role="img" aria-label="scottish flag">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>󠁧󠁢󠁳󠁣󠁴󠁿 Crammond Island Crossing Checker</Heading>
      <a
          style={linkStyle}
          href={`https://environment.data.gov.uk/flood-monitoring/tidegauge/index.html#filter=7&station=E70839`}
      >
        <Text>
        <span role="img" aria-label="data">🗼</span>
        Data source
        </Text>
      </a>
      </Box>

      <Box>
        <StatGroup>
          <Stat>
            <Heading size="sm" mb={2}>Can I cross?</Heading>
            {data == null ? (
                <Skeleton w="fit-content">
                  <StatNumber>Yes</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" color="blue.400"/>
                    "Tide is coming in"
                  </StatHelpText>
                </Skeleton>
            ) : (
                <>
              <StatNumber><Tooltip hasArrow label="Values of less than -0.8 are considered safe to cross" bg="gray.300" color="gray.800">{getCanCross(data) ? "Yes" : "No" }</Tooltip></StatNumber>
              <StatHelpText>
              <StatArrow type={getIsComingIn(data) ? "decrease" : "increase" } color="blue.400"/>
            {getIsComingIn(data) ? "Tide is coming in" : "Tide is going out" }
              </StatHelpText>
              </>

              )}
          </Stat>
        </StatGroup>
      </Box>

      <Box>
      <Heading size="sm">Latest tide values</Heading>
      <Text as="i" fontSize="sm" opacity="0.8">
        Values below -0.8 are safe for crossing
      </Text>

      <UnorderedList mt={2}>
        {data != null && (
        data.map(item => (
          <ListItem key={item.dateTime} style={{ ...listItemStyles, color: getValueColor(item.value) }}>
            <Stat color="gray.800">
              <StatNumber fontSize="md"><Link href={item.measure}>{item.value}</Link></StatNumber>
              <StatHelpText>{formatDateTime(item.dateTime)}</StatHelpText>
            </Stat>
          </ListItem>
        ))
        )}
      </UnorderedList>
      </Box>

      {data != null && (
          <Box mb={8}>
      <Text as="i" fontSize="sm" opacity="0.8">
        We display the latest 100 tide values
      </Text>
      </Box>
      )}
    </Stack>
    </Box>
  )
}

function getCanCross(data) {
  // Check if the latest reading was below -0.8
  // If so, you can cross
  const latestItem = data[0]
  const canCross = latestItem.value <= -0.8
  return canCross
}

function getIsComingIn(data) {
  // Figure out if the tide is going in or out
  const latestItem = data[0]
  const oneItemBack = data[1]
  const isComingIn = latestItem.value >= oneItemBack.value
  return isComingIn
}

function getValueColor(value) {
  return (value <= -0.8) ?  "#48BB78" : "#F56565"
}

function formatDateTime(dt) {
  const d = new Date(dt)
  const mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const leadingHourZero = d.getHours() < 10 ? '0': '' // javascript is ridiculous
  const leadingMinuteZero = d.getMinutes() < 10 ? '0': '' // javascript is ridiculous
  return `${leadingHourZero}${hours}${leadingMinuteZero}${minutes}, ${da} ${mo}`
}

export default IndexPage
