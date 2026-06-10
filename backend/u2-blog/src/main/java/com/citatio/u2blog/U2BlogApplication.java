package com.citatio.u2blog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.citatio.u2blog", "com.citatio.common"})
public class U2BlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(U2BlogApplication.class, args);
    }
}
