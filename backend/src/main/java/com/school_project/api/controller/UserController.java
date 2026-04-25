package com.school_project.api.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @GetMapping
    public List<Map<String, Object>> getUsers() {
        List<Map<String, Object>> users = new ArrayList<>();

        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", 1);
        user1.put("name", "Cemal");
        user1.put("email", "cemal@mail.com");

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", 2);
        user2.put("name", "Ahmet");
        user2.put("email", "ahmet@mail.com");

        users.add(user1);
        users.add(user2);

        return users;
    }
}
