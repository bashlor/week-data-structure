# Week Data Structure

## Time

Time objects are used to create timeslots and manage time limits in days.

There's multiple ways for creating a time object:
```typescript
// 1. Create a time object wihout params
const time = new Time();

// 2. Create a time object with a string
const time2 = new Time("12:00");
const time2Alt = Time.fromString("12:00");

// 3. From a date object
const time3 = new Time(new Date());

// 4. From a time object
const time4 = new Time(time);

// 5. From others static methods
const time5 = Time.fromMinutes(750); // 12:30
const time6 = Time.now(); // Current time

// 6. With  numbers
const time7 = new Time(12, 30); // 12:30
const time8 = new Time(15); // 15:00

// 7. Using an object
const time9 = new Time({ hours: 12, minutes: 30 }); // 12:30
```

### Manipulate Time object

There are various methods to manipulate time objects:
```typescript
// 1. Retrieve hours and minutes
const time = new Time("12:30");
const hours = time.getHours(); // 12
const minutes = time.getMinutes(); // 30
const totalMinutes = time.getTotalMinutes(); // 750

// 2. Add minutes to a time object
const time2 = new Time("13:15");
const time3 = time2.addMinutes(30); // 13:45

// 3. Subtract minutes to a time object
const time4 = new Time("13:15");
const time5 = time4.subtractMinutes(30); // 12:45
```

### Compare Time objects

Time objects can be compared:
```typescript
// 1. isBefore / isAfter
const time = new Time("12:30");
const time2 = new Time("13:15");
const isBefore =  time1.isBefore(time2); // true
const isAfter =  time1.isAfter(time2); // false

// 2. equals
const time3 = new Time("12:30");
const time4 = new Time("13:15");
const time5 = new Time("12:30");
const isEqual = time3.equals(time4); // false
const isEqual2 = time3.equals(time5); // true

// 3. CompareTo
const time6 = new Time("12:30");
const time7 = new Time("13:15");
const diff = time6.compareTo(time7); // -45
```

### Serialization and Date object

Time objects can be serialized to a string or a date object:


```typescript
// 1. To string
const time = new Time("12:30");
const str = time.toString(); // "12:30"

// 2. JSON
const time2 = new Time("12:30");
const json = time2.toJSON(); //  {"hours":12,"minutes":30}

```

## Timeslots

Timeslot objects are used to create timeslots and manage time limits in days.

There's multiple ways for creating a timeslot object:
```typescript

// 1. Using the constructor directly
const timeslot1 = new Timeslot("12:00", "13:00");
const timeslot2 = new Timeslot(new Time("12:00"), new Time("13:00"));
const timeslot4 = new Timeslot([new Time("12:00"), new Time("13:00")]);
const timeslot5 = new Timeslot(timeslot1);

const timeslotSerialized = timeslot1.toJSON();
const timeslot6 = new Timeslot(timeslotSerialized);

// 2. With static method
const timeslot7 = Timeslot.fromString("12:00-13:00");
```

### Getters

These getters are available:
```typescript
const timeslot = new Timeslot("12:00", "13:00");
const start = timeslot.start; // 12:00
const end = timeslot.end; // 13:00
const duration = timeslot.duration; // 60

```



### Manipulate Timeslot objects

Like Time objects, there are operations to manipulate timeslot objects:

```typescript
// 1. Merging timeslot intersection

const timeslot1 = new Timeslot("12:30", "13:30");
const timeslot2 = new Timeslot("13:00", "14:00");
const timeslot3 = new Timeslot("13:00", "15:00");

const [intersectionTimeslot1, rest1] = Timeslot.mergeTimeslotIntersection(timeslot3, timeslot1); // [Timeslot("13:00", "13:30"), [Timeslot("12:30", "13:00", Timeslot("13:30", "15:00")]]
const [intersectionTimeslot2, rest2] = Timeslot.mergeTimeslotIntersection(timeslot2, timeslot3); // [Timeslot("13:00", "14:00"), Timeslot("14:00", "15:00")]
const [intersectionTimeslot3, rest3] = Timeslot.mergeTimeslotIntersection(timeslot1, timeslot1) // [Timeslot("12:30", "13:30"), []]
const resultError = Timeslot.mergeTimeslotIntersection(timeslot1,Timeslot.fromString("16:30-17:30")); // Will throw an error

// 2. Splitting timeslots
const timeslot4 = new Timeslot("12:00", "16:00");
const timelots = Timeslot.split(timeslot4,[new Time("13:00"), new Time("14:00")]); // [Timeslot("12:00", "13:00")// , Timeslot("13:00", "14:00"), Timeslot("14:00", "16:00")]

```

### Compare Timeslot objects

Timeslot objects can be compared:
```typescript
const timeslot1 = new Timeslot("12:30", "13:30");
const timeslot2 = new Timeslot("13:00", "14:00");

const isBefore = timeslot1.isBefore(timeslot2); // true
const isAfter = timeslot1.isAfter(timeslot2); // false
const isEqual = timeslot1.equals(timeslot2); // false
const isOverlapping = timeslot1.overlaps(timeslot2); // true
const isContaining = timeslot1.contains(timeslot2); // false
const compareTo = timeslot1.compareTo(timeslot2); //  -1
```


### Serialization and Date object

Timeslot objects can be serialized to a string or a date object:
```typescript
const timeslot = new Timeslot("12:30", "13:30");
const str = timeslot.toString(); // "12:30-13:30"
const json = timeslot.toJSON(); // {"start":{"hours":12,"minutes":30},"end":{"hours":13,"minutes":30}}
const dates = timeslot.toDate(); // [Date,Date]

```

## TimeslotSeries

TimeslotSeries objects are used to manage multiple timeslots.

There's multiple ways for creating a timeslot series object:
```typescript

const timeslot1 = new Timeslot("12:00", "13:00");
const timeslot2 = new Timeslot("13:00", "14:00");

const serializableTimeslot = {
    timeslots: [timeslot1.toJSON(), timeslot2.toJSON()]
};
const timeslotSeries = new TimeslotSeries([timeslot1, timeslot2]);

const timeslotSeries2 = new TimeslotSeries(timeslotSeries);

const timeslotSeries3 = new TimeslotSeries(serializableTimeslot);
```

### Custom options at initialization

TimeslotSeries objects can be created with custom options:

```typescript
import {TimeslotSeries} from "./timeslot-series";

const timeslot1 = new Timeslot("12:00", "13:00");
const timeslot2 = new Timeslot("13:00", "14:00");

const timeslotSeries = new TimeslotSeries([timeslot1, timeslot2], {
    allowTimeslotMerging: true, // Allow merging timeslots, true by default
    defaultStartLimit: Time.fromString("08:00"), // Default value is 00:00. Set a start limit to 08:00. Allowed timeslots must start at 08:00 (or later).
    defaultEndLimit: Time.fromString("18:00"), // Default value is 23:59. Set a end limit to 18:00.Allowed timeslots must end at 18:00 (or before).
    enforceOverlappingCheck: true, // Enable overlapping check. timeslotseries will throw an error if a timeslot is overlapping with another added timeslot.
});


timeslotSeries.set("07:00-08:00"); // Throw an error, because the timeslot is before the default start limit
timeslotSeries.set("08:00-09:00"); // OK
timeslotSeries.set("17:00-18:00"); // OK

timeslotSeries.set("08:00-10:00"); // Throw an error, because the timeslot is overlapping with another timeslot
timeslotSeries.set("09:00-10:00"); // OK. But the timeslot will be merged with the previous one => [Timeslot("08:00", "10:00")]
```

### Compare timeslots objects

TimeslotSeries objects can be compared:
```typescript
// 1. overlaps
const timeslot1 = new Timeslot("12:00", "13:00");
const timeslot2 = new Timeslot("13:00", "14:00");
const timeslot3 = new Timeslot("12:30", "14:00");
const overlaps1 = timeslot1.overlaps(timeslot2); // false
const overlaps2 = timeslot1.overlaps(timeslot3); // true

// 2. contains
const contains1 = timeslot1.contains(timeslot2); // false
const contains2 = timeslot1.contains(timeslot3); // false
const contains3 = timeslot3.contains(timeslot1); // true

// 3. isBefore / isAfter
const isBefore1 = timeslot1.isBefore(timeslot2); // true
const isBefore2 = timeslot2.isBefore(timeslot1); // false
const isAfter1 = timeslot1.isAfter(timeslot2); // false
const isAfter2 = timeslot2.isAfter(timeslot1); // true

// 4. equals
const equals1 = timeslot1.equals(timeslot2); // false
const equals2 = timeslot1.equals(timeslot1); // true

```

### Add / Remove timeslots in a TimeslotSeries object


TimeslotSeries objects can be modified:
```typescript

const timeslot1 = new Timeslot("12:00", "13:00");

const timeslotSeries = new TimeslotSeries([timeslot1]);

timeslotSeries.add(new Timeslot("13:00", "14:00")); // OK
timeslotSeries.add(new Timeslot("12:30", "13:30")); // Throw an error, because the timeslot is overlapping with another timeslot, unless the option "allowTimeslotMerging" is set to true

timeslotSeries.delete(new Timeslot("13:00", "14:00")); // OK

timeslotSeries.replace(new Timeslot("13:00", "14:00"), new Timeslot("10:00", "12:00")); // OK
```

### Serialization and Date object

TimeslotSeries objects can be serialized to a string or a date object:
```typescript
const timeslot1 = new Timeslot("12:00", "13:00");
const timeslot2 = new Timeslot("13:00", "14:00");

const timeslotSeries = new TimeslotSeries([timeslot1, timeslot2]);

const str = timeslotSeries.toString(); // "12:00-13:00,13:00-14:00"
const json = timeslotSeries.toJSON(); // {"timeslots":[{"start":{"hours":12,"minutes":0},"end":{"hours":13,"minutes":0}},{"start":{"hours":13,"minutes":0},"end":{"hours":14,"minutes":0}}]}
const dates = timeslotSeries.toDate(); // [Date,Date,Date,Date]
```