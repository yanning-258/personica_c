import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import LLMService, { LLMModel } from '../services/llmService';

interface ModelSelectorProps {
  visible: boolean;
  onClose: () => void;
  onModelSelect: (model: LLMModel) => void;
  currentModel: LLMModel;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  visible,
  onClose,
  onModelSelect,
  currentModel,
}) => {
  const models: { id: LLMModel; name: string; description: string; icon: string }[] = [
    {
      id: 'glm-4',
      name: 'ChatGLM-4',
      description: 'Powerful Chinese language model with excellent reasoning capabilities',
      icon: '🤖',
    },
    {
      id: 'deepseek-chat',
      name: 'Deepseek Chat',
      description: 'Advanced AI model with strong coding and reasoning abilities',
      icon: '💻',
    },
  ];

  const handleModelSelect = (model: LLMModel) => {
    console.log('Model selected:', model);
    LLMService.setModel(model);
    onModelSelect(model);
    onClose();
  };

  console.log('ModelSelector rendered, visible:', visible, 'currentModel:', currentModel);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose AI Model</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modelList}>
            {models.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelItem,
                  currentModel === model.id && styles.selectedModel,
                ]}
                onPress={() => handleModelSelect(model.id)}
              >
                <View style={styles.modelIcon}>
                  <Text style={styles.modelIconText}>{model.icon}</Text>
                </View>
                <View style={styles.modelInfo}>
                  <Text
                    style={[
                      styles.modelName,
                      currentModel === model.id && styles.selectedText,
                    ]}
                  >
                    {model.name}
                  </Text>
                  <Text
                    style={[
                      styles.modelDescription,
                      currentModel === model.id && styles.selectedText,
                    ]}
                  >
                    {model.description}
                  </Text>
                </View>
                {currentModel === model.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Current: {LLMService.getModelDisplayName(currentModel)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: 'bold',
  },
  modelList: {
    flex: 1,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedModel: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  modelIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modelIconText: {
    fontSize: 24,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedText: {
    color: '#fff',
  },
  checkmark: {
    marginLeft: 10,
  },
  checkmarkText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ModelSelector; 