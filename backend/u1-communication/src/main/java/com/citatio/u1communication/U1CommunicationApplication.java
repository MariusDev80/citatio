package com.citatio.u1communication;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.citatio.u1communication", "com.citatio.common"})
public class U1CommunicationApplication {

    public static void main(String[] args) {
        SpringApplication.run(U1CommunicationApplication.class, args);
    }
}
