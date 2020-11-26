# managed-misses-cache
Memory cache with bound miss functions to allow for cleaner data layer abstraction
## Installation
    npm install managed-misses-cache

## Example
```typescript
import Cache from 'managed-misses-cache'

Cache.bindMiss('name', 15000, async function(){
    return 'sam'
})

let name = Cache.get('name')
```

## Usage

### Generic Miss Handlers
The key missed is passed to the miss handler allowing you to better generalize their logic.
```typescript
async function getData(key: string): Promise<string> {
    let ret = ''
    switch (key) {
        case 'name':
            ret = 'sam'
            break;
        case 'job':
            ret = 'driver'
            break
    }

    return ret
}

Cache.bindMiss('name', 15000, getData)
Cache.bindMiss('job', 15000, getData)

let name = Cache.get('name')
let job = Cache.get('job')
```