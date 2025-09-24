import { json } from "express";
import { paginationFunction } from "./pagination.js";
import { parseQuery } from "./parseQuery.js";

export class ApiFeatures {
    constructor(mongooseQuery, QueryData) {
        this.mongooseQuery = mongooseQuery
        this.QueryData = QueryData
    }

    pagination() {
        const { page, size } = this.QueryData
        const { limit, skip } = paginationFunction({ page, size })
        this.mongooseQuery.limit(limit).skip(skip)
        return this
    }

    sort() {
        this.mongooseQuery.sort(this.QueryData.sort?.replaceAll(',', ' '))
        return this
    }

    select() {
        this.mongooseQuery.select(this.QueryData.select?.replaceAll(',', ' '))
        return this
    }
    filters() {
        // parse nested keys first
        const queryInstance = parseQuery({ ...this.QueryData })

        const excludeKeysArr = ['page', 'size', 'sort', 'select', 'search']
        excludeKeysArr.forEach((key) => delete queryInstance[key])

        // replace operators with $
        let queryStr = JSON.stringify(queryInstance)
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in|nin|eq|neq|regex)\b/g,
            match => `$${match}`
        )

        const queryObj = JSON.parse(queryStr)

        // convert numbers (except regex)
        for (let key in queryObj) {
            if (typeof queryObj[key] === "object") {
                for (let op in queryObj[key]) {
                    if (op !== "$regex" && !isNaN(queryObj[key][op])) {
                        queryObj[key][op] = Number(queryObj[key][op])
                    }
                }
            }
        }

        this.mongooseQuery = this.mongooseQuery.find(queryObj)
        return this
    }

}