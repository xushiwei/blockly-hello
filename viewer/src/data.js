export const data = `{
    "blocks": {
        "languageVersion": 0,
        "blocks": [
            {
                "type": "goplus_for_each",
                "x": 10,
                "y": 10,
                "fields": {
                    "VAR": "i"
                },
                "inputs": {
                    "COND": {
                        "shadow": {
                            "type": "logic_boolean",
                            "fields": {
                                "BOOL": "TRUE"
                            }
                        },
                        "block": {
                            "type": "logic_boolean",
                            "fields": {
                                "BOOL": "TRUE"
                            }
                        }
                    },
                    "BODY": {
                        "block": {
                            "type": "goplus_if",
                            "inputs": {
                                "COND": {
                                    "shadow": {
                                        "type": "logic_boolean",
                                        "fields": {
                                            "BOOL": "TRUE"
                                        }
                                    }
                                },
                                "BODY": {
                                    "block": {
                                        "type": "goplus_for_cond",
                                        "inputs": {
                                            "COND": {
                                                "shadow": {
                                                    "type": "logic_boolean",
                                                    "fields": {
                                                        "BOOL": "TRUE"
                                                    }
                                                }
                                            },
                                            "BODY": {
                                                "block": {
                                                    "type": "goplus_for_count",
                                                    "fields": {
                                                        "VAR": "i"
                                                    },
                                                    "inputs": {
                                                        "FROM": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "fields": {
                                                                    "NUM": 0
                                                                }
                                                            }
                                                        },
                                                        "TO": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "fields": {
                                                                    "NUM": 50
                                                                }
                                                            },
                                                            "block": {
                                                                "type": "math_number",
                                                                "fields": {
                                                                    "NUM": 50
                                                                }
                                                            }
                                                        },
                                                        "BY": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "fields": {
                                                                    "NUM": 1
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]
    }
}
`;
