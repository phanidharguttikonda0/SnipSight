package main

import (
    "github.com/gin-gonic/gin"
    "log"
)

func main() {
    r := gin.Default()
    r.GET("/", func (c *gin.Context){
    log.Println("Request was accepted")
        c.JSON(200, gin.H{
            "message" : "Just a Simple Route initialization",
        })
    })
    r.Run(":9090")
}