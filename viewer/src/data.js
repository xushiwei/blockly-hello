export const data = `{
    "blocks": {
        "languageVersion": 0,
        "blocks": [
            {
                "type": "goplus_for_each",
                "id": "VNW6Ly*gP;W8aj^@VLST",
                "x": 115,
                "y": 119,
                "fields": {
                    "VAR": "i"
                },
                "inputs": {
                    "COND": {
                        "shadow": {
                            "type": "logic_boolean",
                            "id": "NXpy?hAIGR],1^hkaG#q",
                            "fields": {
                                "BOOL": "TRUE"
                            }
                        },
                        "block": {
                            "type": "logic_boolean",
                            "id": "P:+g[+;}yYKqra?#IJ3F",
                            "fields": {
                                "BOOL": "TRUE"
                            }
                        }
                    },
                    "BODY": {
                        "block": {
                            "type": "goplus_if",
                            "id": "P,C#j@1(8f+g/OW6#D-u",
                            "inputs": {
                                "COND": {
                                    "shadow": {
                                        "type": "logic_boolean",
                                        "id": "fG*~v5T)sINf(mO_^o)g",
                                        "fields": {
                                            "BOOL": "TRUE"
                                        }
                                    }
                                },
                                "BODY": {
                                    "block": {
                                        "type": "goplus_for_cond",
                                        "id": "YtOd!%c)m/=}aXoF%z~q",
                                        "inputs": {
                                            "COND": {
                                                "shadow": {
                                                    "type": "logic_boolean",
                                                    "id": "{i[SN#T.+SQqXN)LHN=q",
                                                    "fields": {
                                                        "BOOL": "TRUE"
                                                    }
                                                }
                                            },
                                            "BODY": {
                                                "block": {
                                                    "type": "goplus_for_count",
                                                    "id": "{mLC(H@]p4oS$m^lRZ1Q",
                                                    "fields": {
                                                        "VAR": "i"
                                                    },
                                                    "inputs": {
                                                        "FROM": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "id": "G(tZ/GoOxBaubJoO-RMs",
                                                                "fields": {
                                                                    "NUM": 0
                                                                }
                                                            }
                                                        },
                                                        "TO": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "id": "?lye(Z@O(503AR1qlj_4",
                                                                "fields": {
                                                                    "NUM": 50
                                                                }
                                                            },
                                                            "block": {
                                                                "type": "math_number",
                                                                "id": "J;M6vA^@2Jc-EKgC2wBZ",
                                                                "fields": {
                                                                    "NUM": 50
                                                                }
                                                            }
                                                        },
                                                        "BY": {
                                                            "shadow": {
                                                                "type": "math_number",
                                                                "id": "(S[(-+b.V.v*O!$A+:+3",
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
