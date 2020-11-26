# managed-misses-cache
Memory cache with bound miss functions to allow for cleaner data layer abstraction
## Installation
    npm install managed-misses-cache

## Usage
```typescript
import Cache from 'managed-misses-cache'

Cache.bindMiss('name', 15000, async function(){
    return 'sam'
})

let name = Cache.get('name')
```