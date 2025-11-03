# MongoDB Aggregate 工具文档

## MongoDB Aggregate 主要操作符

### 1. **查询/过滤阶段**
- `$match` - 过滤文档，类似 `find()`
- `$limit` - 限制输出文档数量
- `$skip` - 跳过指定数量的文档
- `$sample` - 随机采样文档

### 2. **分组阶段**
- `$group` - 按表达式分组文档
- `$bucket` - 按范围分组
- `$bucketAuto` - 自动分组
- `$facet` - 多管道并行处理

### 3. **投影阶段**
- `$project` - 选择/重命名/计算字段
- `$addFields` / `$set` - 添加新字段
- `$unset` - 移除字段

### 4. **展开/数组操作**
- `$unwind` - 展开数组字段
- `$arrayElemAt` - 获取数组元素
- `$size` - 获取数组大小
- `$slice` - 数组切片

### 5. **连接操作**
- `$lookup` - 左外连接（类似 SQL JOIN）
- `$graphLookup` - 递归查找
- `$unionWith` - 合并不同集合的结果

### 6. **排序阶段**
- `$sort` - 排序文档

### 7. **聚合表达式操作符**
- `$sum` - 求和
- `$avg` - 平均值
- `$min` - 最小值
- `$max` - 最大值
- `$count` - 计数
- `$first` - 第一个值
- `$last` - 最后一个值
- `$push` - 将值添加到数组
- `$addToSet` - 将唯一值添加到数组

### 8. **日期操作符**
- `$year`, `$month`, `$dayOfMonth` - 提取日期部分
- `$dateToString` - 日期格式化

### 9. **字符串操作符**
- `$concat` - 连接字符串
- `$substr` - 子字符串
- `$toLower` / `$toUpper` - 大小写转换

### 10. **条件操作符**
- `$cond` - 三元运算符
- `$ifNull` - 如果为 null 则返回默认值
- `$switch` - switch 语句

### 11. **数学操作符**
- `$add`, `$subtract`, `$multiply`, `$divide` - 基本运算
- `$mod` - 取模
- `$pow` - 幂运算
- `$sqrt` - 平方根

### 12. **其他**
- `$replaceRoot` - 替换根文档
- `$merge` - 将结果写入集合
- `$out` - 将结果写入新集合
- `$redact` - 根据条件限制字段

## 使用示例

### 基本用法

```javascript
// 基本用法
collection.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: "$category", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } }
])

// 在你的代码中，可以这样使用：
const collection = await getMongoCollection('backend_reports');
const result = await collection.aggregate([
  { $match: { reportType: 'daily' } },
  { $unwind: '$data' },
  { $group: { _id: '$data.code', totalProfit: { $sum: '$data.totalProfit' } } }
]).toArray();
```

## 实际应用场景

### 场景 1: 查询单个 Dealer 在时间范围内的总和

查询 PM001 在指定日期范围内的 `totalProfit` 和 `totalCost` 总和：

```javascript
const collection = await getMongoCollection('backend_reports');

const result = await collection.aggregate([
  // 1. 匹配日期范围和报告类型
  {
    $match: {
      reportType: 'daily',  // 或 'weekly'
      startDate: { $gte: '2024-01-01', $lte: '2024-12-31' }
    }
  },
  
  // 2. 展开 data 数组（每个数组元素变成独立的文档）
  {
    $unwind: '$data'
  },
  
  // 3. 过滤出 code 为 PM001 的记录
  {
    $match: {
      'data.code': 'PM001'
    }
  },
  
  // 4. 按 code 分组并求和
  {
    $group: {
      _id: '$data.code',
      totalProfit: { $sum: '$data.totalProfit' },
      totalCost: { $sum: '$data.totalCost' },
      count: { $sum: 1 }  // 记录数量
    }
  }
]).toArray();

// 结果示例：
// [
//   {
//     _id: "PM001",
//     totalProfit: 1234567.89,
//     totalCost: 987654.32,
//     count: 60
//   }
// ]
```

### 场景 2: 查询多个 Dealers 的总和

```javascript
// 查询多个 dealers（如 PM001, EA002）的总和
const result = await collection.aggregate([
  {
    $match: {
      reportType: 'daily',
      startDate: { $gte: '2024-01-01', $lte: '2024-12-31' }
    }
  },
  {
    $unwind: '$data'
  },
  {
    $match: {
      'data.code': { $in: ['PM001', 'EA002'] }
    }
  },
  {
    $group: {
      _id: '$data.code',
      totalProfit: { $sum: '$data.totalProfit' },
      totalCost: { $sum: '$data.totalCost' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { totalProfit: -1 }  // 按利润排序
  }
]).toArray();
```

### 场景 3: 按日期和 Dealer 分组（查看每日/每周详细数据）

```javascript
// 查看 PM001 每天/每周的详细数据
const result = await collection.aggregate([
  {
    $match: {
      reportType: 'daily',
      startDate: { $gte: '2024-01-01', $lte: '2024-12-31' }
    }
  },
  {
    $unwind: '$data'
  },
  {
    $match: {
      'data.code': 'PM001'
    }
  },
  {
    $group: {
      _id: {
        date: '$startDate',
        code: '$data.code'
      },
      totalProfit: { $sum: '$data.totalProfit' },
      totalCost: { $sum: '$data.totalCost' }
    }
  },
  {
    $sort: { '_id.date': 1 }
  }
]).toArray();
```

### 场景 4: 计算所有 Dealers 的总和

```javascript
// 查看所有 dealers 在时间范围内的总和
const result = await collection.aggregate([
  {
    $match: {
      reportType: 'daily',
      startDate: { $gte: '2024-01-01', $lte: '2024-12-31' }
    }
  },
  {
    $unwind: '$data'
  },
  {
    $group: {
      _id: '$data.code',
      totalProfit: { $sum: '$data.totalProfit' },
      totalCost: { $sum: '$data.totalCost' },
      avgProfit: { $avg: '$data.totalProfit' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { totalProfit: -1 }
  }
]).toArray();
```

### 场景 5: 在 TypeScript API 路由中使用

```typescript
// 示例：在 API 路由中使用
import { getMongoCollection, closeMongoConnection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const collection = await getMongoCollection('backend_reports');
    
    const pm001Summary = await collection.aggregate([
      {
        $match: {
          reportType: 'daily',
          startDate: { $gte: '2024-01-01', $lte: '2024-12-31' }
        }
      },
      {
        $unwind: '$data'
      },
      {
        $match: {
          'data.code': 'PM001'
        }
      },
      {
        $group: {
          _id: '$data.code',
          totalProfit: { $sum: '$data.totalProfit' },
          totalCost: { $sum: '$data.totalCost' },
          recordCount: { $sum: 1 }
        }
      }
    ]).toArray();
    
    await closeMongoConnection();
    
    return NextResponse.json({
      success: true,
      data: pm001Summary
    });
  } catch (error) {
    await closeMongoConnection();
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

## 数据结构说明

当前 MongoDB 中存储的数据结构：

```json
{
  "_id": "backend-daily-2024-01-01-2024-01-01",
  "reportType": "daily",
  "startDate": "2024-01-01",
  "endDate": "2024-01-01",
  "data": [
    {
      "code": "PM001",
      "totalProfit": 347002.128800746,
      "totalCost": 288744.76832866
    },
    {
      "code": "EA002",
      "totalProfit": 459718.918905265,
      "totalCost": 86381.6170779585
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 注意事项

1. **使用 `$unwind` 展开数组**：由于 `data` 是数组，需要先用 `$unwind` 将其展开，才能对数组中的每个元素进行聚合操作。

2. **日期范围查询**：使用 `$gte` (大于等于) 和 `$lte` (小于等于) 来匹配日期范围。

3. **性能优化**：尽量在 `$match` 阶段先过滤数据，减少后续处理的数据量。

4. **连接管理**：记得在完成后调用 `closeMongoConnection()` 关闭连接。

5. **类型安全**：在 TypeScript 中使用时，注意类型定义和错误处理。

