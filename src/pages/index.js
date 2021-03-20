import * as React from "react";
import { useEffect, useState } from "react";
import {
  Stack,
  Heading,
  Box,
  Text,
  ListItem,
  UnorderedList,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Skeleton,
  Link,
  Alert,
  Flex,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { Line } from "@reactchartjs/react-chart.js";

// type DataItem = {
//   @id: string
//   dateTime: string
//   measure: string
//   value: float
// }

const UNDERWATER_VALUE = -0.8;
const DANGER_VALUE = -1.1;

const listItemStyles = {
  fontSize: 24, // For the bullets
  maxWidth: 560,
  marginBottom: 30,
};

const linkStyle = {
  color: "#8954A8",
};

function getMockData(data) {
  const mockArr = new Array(100).fill(0);

  let labels = mockArr;
  let dataPoints = mockArr;

  if (data != null) {
    labels = Array.from(data, (item) => formatTime(item.dateTime));
    dataPoints = Array.from(data, (item) => item.value);
  }

  const crossingBelowLine = Array.from(mockArr, (item) => UNDERWATER_VALUE);

  return {
    labels: labels.reverse(),
    datasets: [
      {
        label: "Tide value",
        data: dataPoints.reverse(),
        fill: true,
        backgroundColor: "#EDF2F7",
        borderColor: "#63B3ED",
        pointRadius: 0,
        borderWidth: 1,
      },
      {
        label: "Crossing is possible below here",
        data: crossingBelowLine,
        fill: false,
        backgroundColor: "#68D391",
        borderColor: "#68D391",
        pointRadius: 0,
        borderWidth: 1,
      },
    ],
  };
}

const options = {
  scales: {
    xAxes: [
      {
        ticks: {
          maxTicksLimit: 10,
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: false,
          suggestedMin: -1.5,
          suggestedMax: 2,
        },
        scaleLabel: {
          display: true,
          labelString: "👈 going out —️ coming in 👉",
          fontSize: 12,
        },
      },
    ],
  },
};

const IndexPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const request = await fetch(
        "https://environment.data.gov.uk/flood-monitoring/id/stations/E70839/readings.json?_limit=100&_sorted"
      );
      const data = await request.json();
      setData(data.items);
    };

    if (data == null) {
      getData();
    }
  });

  return (
    <Box as="main" marginX={[4, 50, 50, 100]} marginY={[4, 50, 50, 70]}>
      <title>Home Page</title>

      <Stack spacing={12}>
        <Box>
          <Heading>
            <span role="img" aria-label="scottish flag">
              🏴󠁧󠁢󠁳󠁣󠁴󠁿
            </span>
            󠁧󠁢󠁳󠁣󠁴󠁿 Crammond Island Crossing Checker
          </Heading>
          <a
            style={linkStyle}
            href={`https://environment.data.gov.uk/flood-monitoring/tidegauge/index.html#filter=7&station=E70839`}
          >
            <Text>
              <span role="img" aria-label="data">
                🗼
              </span>
              Data source
            </Text>
          </a>
        </Box>

        <Box>
          <StatGroup>
            <Stat>
              <Heading size="sm" mb={2}>
                Can I cross?
              </Heading>
              {data == null ? (
                <Skeleton w="fit-content">
                  <StatNumber>Yes</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" color="blue.400" />
                    "Tide is coming in"
                  </StatHelpText>
                </Skeleton>
              ) : (
                <>
                  <StatNumber>{canCross(data) ? "Yes" : "No"}</StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={isComingIn(data) ? "increase" : "decrease"}
                      color="blue.400"
                    />
                    {isComingIn(data)
                      ? "Tide is coming in"
                      : "Tide is going out"}
                  </StatHelpText>
                  {showSoonUnderwaterWarning(data) && (
                    <Alert status="warning" variant="left-accent">
                      <AlertIcon />
                      <Flex direction={["column", "column", "row", "row"]}>
                        <AlertTitle>
                          Crossing will soon be underwater.
                        </AlertTitle>
                        <AlertDescription>
                          Get back to mainland!
                        </AlertDescription>
                      </Flex>
                    </Alert>
                  )}
                </>
              )}
            </Stat>
          </StatGroup>
        </Box>

        <Heading size="sm" mb={-10}>
          Recent tide values (last 24 hours)
        </Heading>
        <Line data={getMockData(data)} options={options} />

        <Box>
          <Heading size="sm">Latest tide values</Heading>
          <Text as="i" fontSize="sm" opacity="0.8">
            Crossing is possible when the tide value is below {UNDERWATER_VALUE}
          </Text>

          <UnorderedList mt={2}>
            {data != null &&
              data.map((item) => (
                <ListItem
                  key={item.dateTime}
                  style={{
                    ...listItemStyles,
                    color: getValueColor(item.value),
                  }}
                >
                  <Stat color="gray.800">
                    <StatNumber fontSize="md">
                      <Link href={item.measure}>{item.value.toFixed(2)}</Link>
                    </StatNumber>
                    <StatHelpText>{formatDateTime(item.dateTime)}</StatHelpText>
                  </Stat>
                </ListItem>
              ))}
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
  );
};

function canCross(data) {
  // Check if the latest reading was below -0.8
  // If so, you can cross
  const latestItem = data[0];
  return latestItem.value <= UNDERWATER_VALUE;
}

function isComingIn(data) {
  // Figure out if the tide is going in or out
  const latestItem = data[0];
  const oneItemBack = data[1];
  return latestItem.value >= oneItemBack.value;
}

function showSoonUnderwaterWarning(data) {
  // If you can't cross at all, we don't need the warning
  if (!canCross(data)) {
    return false;
  }

  // If the tide is going out, we're fine
  if (!isComingIn(data)) {
    return false;
  }

  // If you can cross and the tide is coming in, we might be in trouble.
  // Figure out if the crossing will soon be underwater
  const latestItem = data[0];
  const isSoonUnderwater = latestItem.value >= DANGER_VALUE;

  return isSoonUnderwater;
}

function getValueColor(value) {
  return value <= UNDERWATER_VALUE ? "#48BB78" : "#F56565";
}

function formatDateTime(dt) {
  const d = new Date(dt);
  const mo = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
  const da = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const leadingHourZero = d.getHours() < 10 ? "0" : ""; // javascript is ridiculous
  const leadingMinuteZero = d.getMinutes() < 10 ? "0" : ""; // javascript is ridiculous
  return `${leadingHourZero}${hours}:${leadingMinuteZero}${minutes}, ${da} ${mo}`;
}

function formatTime(dt) {
  const d = new Date(dt);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const leadingHourZero = d.getHours() < 10 ? "0" : ""; // javascript is ridiculous
  const leadingMinuteZero = d.getMinutes() < 10 ? "0" : ""; // javascript is ridiculous
  return `${leadingHourZero}${hours}:${leadingMinuteZero}${minutes}`;
}

export default IndexPage;
