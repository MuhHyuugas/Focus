import { Text } from "@/components/ui/text";
import { View, Modal, TouchableOpacity, TextInput, Switch } from "react-native";
import { useState } from "react";
import { X, Check } from "lucide-react-native";

interface SymptomModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (data: {
        mood: number | undefined;
        anxiety: boolean;
        focus: number | undefined;
        notes: string;
    }) => void;
}

const MOODS = [
    { value: 1, label: "😞" },
    { value: 2, label: "😐" },
    { value: 3, label: "🙂" },
    { value: 4, label: "😀" },
    { value: 5, label: "🤩" },
];

export default function SymptomModal({
    visible,
    onClose,
    onConfirm,
}: SymptomModalProps) {
    const [mood, setMood] = useState<number | undefined>(undefined);
    const [anxiety, setAnxiety] = useState(false);
    const [focus, setFocus] = useState<number | undefined>(undefined);
    const [notes, setNotes] = useState("");

    const handleConfirm = () => {
        onConfirm({ mood, anxiety, focus, notes });
        // Reset states
        setMood(undefined);
        setAnxiety(false);
        setFocus(undefined);
        setNotes("");
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white m-4 p-6 rounded-2xl w-[90%] gap-4">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-xl font-bold">Como você está?</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color="#000" size={24} />
                        </TouchableOpacity>
                    </View>

                    {/* Mood Selector */}
                    <View>
                        <Text className="font-semibold mb-2">Humor</Text>
                        <View className="flex-row justify-between">
                            {MOODS.map((m) => (
                                <TouchableOpacity
                                    key={m.value}
                                    onPress={() => setMood(m.value)}
                                    className={`p-2 rounded-full ${mood === m.value ? "bg-gray-200" : ""
                                        }`}
                                >
                                    <Text className="text-2xl">{m.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Anxiety Switch */}
                    <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-xl">
                        <Text className="font-semibold">Sentiu ansiedade?</Text>
                        <Switch
                            value={anxiety}
                            onValueChange={setAnxiety}
                            trackColor={{ false: "#767577", true: "#179A9B" }}
                            thumbColor={anxiety ? "#fff" : "#f4f3f4"}
                        />
                    </View>

                    {/* Focus Slider (Simplified as 1-5 buttons) */}
                    <View>
                        <Text className="font-semibold mb-2">Nível de Foco (1-5)</Text>
                        <View className="flex-row justify-between">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <TouchableOpacity
                                    key={val}
                                    onPress={() => setFocus(val)}
                                    className={`w-10 h-10 items-center justify-center rounded-full border ${focus === val
                                            ? "bg-[#179A9B] border-[#179A9B]"
                                            : "bg-white border-gray-300"
                                        }`}
                                >
                                    <Text
                                        className={`${focus === val ? "text-white" : "text-gray-700"
                                            } font-bold`}
                                    >
                                        {val}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Notes */}
                    <View>
                        <Text className="font-semibold mb-2">Notas</Text>
                        <TextInput
                            className="border border-gray-200 rounded-xl p-3 h-24 bg-gray-50 bg-opacity-50"
                            placeholder="Alguma observação?"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        onPress={handleConfirm}
                        className="bg-[#179A9B] p-4 rounded-full items-center flex-row justify-center gap-2 mt-2"
                    >
                        <Check color="white" size={20} />
                        <Text className="text-white font-bold text-lg">Confirmar Dose</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
