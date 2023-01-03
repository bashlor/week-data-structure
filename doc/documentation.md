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
const resultError = Timeslot.mergeTimeslotIntersection(timeslot1,Timeslot.fromString("16:30-17:30")); // Throw an error

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
```


### Serialization and Date object

Timeslot objects can be serialized to a string or a date object:
```typescript
const timeslot = new Timeslot("12:30", "13:30");
const str = timeslot.toString(); // "12:30-13:30"
const json = timeslot.toJSON(); // {"start":{"hours":12,"minutes":30},"end":{"hours":13,"minutes":30}}
const dates = timeslot.toDate(); // [Date,Date]
```